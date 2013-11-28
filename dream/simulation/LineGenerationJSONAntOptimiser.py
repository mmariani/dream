# ===========================================================================
# Copyright 2013 University of Limerick
#
# This file is part of DREAM.
#
# DREAM is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# DREAM is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with DREAM.  If not, see <http://www.gnu.org/licenses/>.
# ===========================================================================

'''
Created on 7 May 2013

@author: George
'''
'''
main script. Reads data from JSON, generates and runs the simulation and prints the results to excel
'''

# ===========================================================================
#                                    IMPORTS
# ===========================================================================
from warnings import warn
import logging
logger = logging.getLogger("dream.platform")


try:
  import scipy
except ImportError:
  class scipy:
    class stats:
      @staticmethod
      def bayes_mvs(*args, **kw):
        warn("Scipy is missing, using fake implementation")
        serie, confidence = args
        import numpy
        mean = numpy.mean(serie), (numpy.min(serie), numpy.max(serie))
        var = 0, (0, 0)
        std = 0, (0, 0) 
        return mean, var, std
  import sys
  sys.modules['scipy.stats'] = scipy.stats
  sys.modules['scipy'] = scipy
  logger.error("Scipy cannot be imported, using dummy implementation")

from SimPy.Simulation import activate, initialize, simulate, now, infinity
from Globals import G 
from Source import Source
from Machine import Machine
from Exit import Exit
from Queue import Queue
from QueueLIFO import QueueLIFO
from Repairman import Repairman
from Part import Part
from Frame import Frame
from Assembly import Assembly
from Dismantle import Dismantle
from Conveyer import Conveyer
from Job import Job
from MachineJobShop import MachineJobShop
from QueueJobShop import QueueJobShop
from ExitJobShop import ExitJobShop
from Batch import Batch
from SubBatch import SubBatch
from BatchSource import BatchSource
from BatchDecomposition import BatchDecomposition
from BatchReassembly import BatchReassembly
from BatchScrapMachine import BatchScrapMachine
from LineClearance import LineClearance

import ExcelHandler
import time
import json
from random import Random
import sys
import os.path

# ===========================================================================
#                       reads general simulation inputs
# ===========================================================================
def readGeneralInput():
    general=G.JSONData['general']                                           # read the dict with key 'general'
    G.numberOfReplications=int(general.get('numberOfReplications', '1'))    # read the number of replications / default 1
    G.maxSimTime=float(general.get('maxSimTime', '100'))                    # get the maxSimTime / default 100
    G.trace=general.get('trace', 'No')                                      # get trace in order to check if trace is requested
    G.confidenceLevel=float(general.get('confidenceLevel', '0.95'))         # get the confidence level

# ===========================================================================
#                       creates the simulation objects
# ===========================================================================
def createObjects():

    json_data = G.JSONData
    #Read the json data
    nodes = json_data['nodes']                      # read from the dictionary the dicts with key 'nodes'
    edges = json_data['edges']                      # read from the dictionary the dicts with key 'edges'


    # -----------------------------------------------------------------------
    #                getSuccesorList method to get the successor 
    #                       list of object with ID = id
    #                         XXX slow implementation
    # -----------------------------------------------------------------------
    def getSuccessorList(node_id, predicate=lambda source, destination, edge_data: True):
      successor_list = []                           # dummy variable that holds the list to be returned
      for source, destination, edge_data in edges.values(): # for all the values in the dictionary edges
        if source == node_id:                               # for the node_id argument
          if predicate(source, destination, edge_data):     # find its 'destinations' and 
            successor_list.append(destination)              # append it to the successor list
      # XXX We should probably not need to sort, but there is a bug that
      # prevents Topology10 to work if this sort is not used.
      successor_list.sort()
      return successor_list
    # -----------------------------------------------------------------------
    #                define the lists of each object type
    # -----------------------------------------------------------------------
    G.SourceList=[]
    G.MachineList=[]
    G.ExitList=[]
    G.QueueList=[]    
    G.RepairmanList=[]
    G.AssemblyList=[]
    G.DismantleList=[]
    G.ConveyerList=[]
    G.JobList=[]
    G.WipList=[]
    G.EntityList=[]  
    G.MachineJobShopList=[]
    G.QueueJobShopList=[]
    G.ExitJobShopList=[]
    G.BatchDecompositionList=[]
    G.BatchSourceList=[]
    G.BatchReassemblyList=[]
    G.LineClearanceList=[]
    G.BatchScrapMachine=[]
    
    # -----------------------------------------------------------------------
    #                loop through all the model resources 
    #            search for repairmen in order to create them
    #                   read the data and create them
    # -----------------------------------------------------------------------
    for (element_id, element) in nodes.iteritems():                 # use an iterator to go through all the nodes
                                                                    # the key is the element_id and the second is the 
                                                                    # element itself 
        element['id'] = element_id                                  # create a new entry for the element (dictionary)
                                                                    # with key 'id' and value the the element_id
        resourceClass = element.get('_class', 'not found')          # get the class type of the element
        if resourceClass=='Dream.Repairman':                    # check the object type
            id = element.get('id', 'not found')                     # get the id of the element   / default 'not_found'
            name = element.get('name', 'not found')                 # get the name of the element / default 'not_found'
            capacity = int(element.get('capacity', '1'))            # get the capacity of the el. / defautl '1'
            R = Repairman(element_id, name, capacity)               # create a repairman object
            R.coreObjectIds=getSuccessorList(id)                    # update the list of objects that the repairman repairs
                                                                    # calling the getSuccessorList() method on the repairman
            G.RepairmanList.append(R)                               # add the repairman to the RepairmanList
    # -----------------------------------------------------------------------
    #                    loop through all the elements    
    #                    read the data and create them
    # -----------------------------------------------------------------------
    for (element_id, element) in nodes.iteritems():
        element['id'] = element_id
        objClass=element.get('_class', 'not found')   
        if objClass=='Dream.Source':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            interarrivalTime=element.get('interarrivalTime', 'not found')
            distributionType=interarrivalTime.get('distributionType', 'not found')
            mean=float(interarrivalTime.get('mean', '0'))        
            entity=str_to_class(element.get('entity', 'not found'))     # initialize entity
            S=Source(id, name, distributionType, mean, entity)          # initialize Source
            S.nextIds=getSuccessorList(id)
            G.SourceList.append(S)
            G.ObjList.append(S)
            
        if objClass=='Dream.BatchSource':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            interarrivalTime=element.get('interarrivalTime', 'not found')
            distributionType=interarrivalTime.get('distributionType', 'not found')
            mean=float(interarrivalTime.get('mean', '0'))        
            entity=str_to_class(element.get('entity', 'not found'))          
            batchNumberOfUnits=int(element.get('batchNumberOfUnits', 'not found'))
            S=BatchSource(id, name, distributionType, mean, entity, batchNumberOfUnits)
            S.nextIds=getSuccessorList(id)
            G.BatchSourceList.append(S)
            G.SourceList.append(S)
            G.ObjList.append(S)
            
        elif objClass=='Dream.Machine':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            processingTime=element.get('processingTime', 'not found')
            distributionType=processingTime.get('distributionType', 'not found')
            mean=float(processingTime.get('mean', '0'))  
            stdev=float(processingTime.get('stdev', '0'))  
            min=float(processingTime.get('min', '0')) 
            max=float(processingTime.get('max', '0'))
            failures=element.get('failures', 'not found')  
            failureDistribution=failures.get('failureDistribution', 'not found')
            MTTF=float(failures.get('MTTF', '0'))   
            MTTR=float(failures.get('MTTR', '0')) 
            availability=float(failures.get('availability', '0'))  
            r='None'
            for repairman in G.RepairmanList:                   # check which repairman in the G.RepairmanList
                if(id in repairman.coreObjectIds):              # (if any) is assigned to repair 
                    r=repairman                                 # the machine with ID equal to id
                    
            M=Machine(id, name, 1, distribution=distributionType,  failureDistribution=failureDistribution,
                                                    MTTF=MTTF, MTTR=MTTR, availability=availability, repairman=r,
                                                    mean=mean,stdev=stdev,min=min,max=max)
            M.nextIds=getSuccessorList(id)                      # update the nextIDs list of the machine
            G.MachineList.append(M)                             # add machine to global MachineList
            G.ObjList.append(M)                                 # add machine to ObjList
            
        elif objClass=='Dream.BatchScrapMachine':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            processingTime=element.get('processingTime', 'not found')
            distributionType=processingTime.get('distributionType', 'not found')
            mean=float(processingTime.get('mean', '0'))  
            stdev=float(processingTime.get('stdev', '0'))  
            min=float(processingTime.get('min', '0')) 
            max=float(processingTime.get('max', '0'))            
            scrapQuantity=element.get('scrapQuantity', 'not found')
            scrapDistributionType=scrapQuantity.get('distributionType', 'not found')
            scrMean=int(scrapQuantity.get('mean', '0'))  
            scrStdev=float(scrapQuantity.get('stdev', '0'))  
            scrMin=int(scrapQuantity.get('min', '0')) 
            scrMax=int(scrapQuantity.get('max', '0'))            
            failures=element.get('failures', 'not found')  
            failureDistribution=failures.get('failureDistribution', 'not found')
            MTTF=float(failures.get('MTTF', '0'))   
            MTTR=float(failures.get('MTTR', '0')) 
            availability=float(failures.get('availability', '0'))  
            r='None'
            for repairman in G.RepairmanList:                   # check which repairman in the G.RepairmanList
                if(id in repairman.coreObjectIds):              # (if any) is assigned to repair 
                    r=repairman                                 # the machine with ID equal to id
                    
            M=BatchScrapMachine(id, name, 1, distribution=distributionType,  failureDistribution=failureDistribution,
                                                    MTTF=MTTF, MTTR=MTTR, availability=availability, repairman=r,
                                                    mean=mean,stdev=stdev,min=min,max=max, scrMean=scrMean, 
                                                    scrStdev=scrStdev,scrMin=scrMin,scrMax=scrMax)
            M.nextIds=getSuccessorList(id)                      # update the nextIDs list of the machine
            G.MachineList.append(M)                             # add machine to global MachineList
            G.BatchScrapMachine.append(M)
            G.ObjList.append(M)                                 # add machine to ObjList
            
        
        elif objClass=='Dream.MachineJobShop':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            processingTime=element.get('processingTime', 'not found')
            distributionType=processingTime.get('distributionType', 'not found')
            mean=float(processingTime.get('mean', '0'))  
            stdev=float(processingTime.get('stdev', '0'))  
            min=float(processingTime.get('min', '0')) 
            max=float(processingTime.get('max', '0'))
            failures=element.get('failures', 'not found')  
            failureDistribution=failures.get('failureDistribution', 'not found')
            MTTF=float(failures.get('MTTF', '0'))   
            MTTR=float(failures.get('MTTR', '0')) 
            availability=float(failures.get('availability', '0'))  
            r='None'
            for repairman in G.RepairmanList:
                if(id in repairman.coreObjectIds):
                    r=repairman
                    
            M=MachineJobShop(id, name, 1, distribution=distributionType,  failureDistribution=failureDistribution,
                                                    MTTF=MTTF, MTTR=MTTR, availability=availability, repairman=r,
                                                    mean=mean,stdev=stdev,min=min,max=max)
            M.nextIds=getSuccessorList(id)
            G.MachineJobShopList.append(M)
            G.MachineList.append(M)
            G.ObjList.append(M)
            
        elif objClass=='Dream.Exit':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            E=Exit(id, name)
            G.ExitList.append(E)
            G.ObjList.append(E)
            
        elif objClass=='Dream.ExitJobShop':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            E=ExitJobShop(id, name)
            G.ExitJobShopList.append(E)
            G.ExitList.append(E)
            G.ObjList.append(E)
            
        elif objClass=='Dream.Queue':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            capacity=int(element.get('capacity', '1'))
            isDummy=bool(int(element.get('isDummy', '0')))
            schedulingRule=element.get('schedulingRule', 'FIFO')
            Q=Queue(id, name, capacity, isDummy, schedulingRule=schedulingRule)
            Q.nextIds=getSuccessorList(id)
            G.QueueList.append(Q)
            G.ObjList.append(Q)
            
        elif objClass=='Dream.QueueJobShop':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            capacity=int(element.get('capacity', '1'))
            isDummy=bool(int(element.get('isDummy', '0')))
            schedulingRule=element.get('schedulingRule', 'FIFO')
            Q=QueueJobShop(id, name, capacity, isDummy, schedulingRule=schedulingRule)
            Q.nextIds=getSuccessorList(id)
            G.QueueList.append(Q)
            G.QueueJobShopList.append(Q)
            G.ObjList.append(Q)
            
        elif objClass=='Dream.QueueLIFO':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            successorList=element.get('successorList', 'not found')
            capacity=int(element.get('capacity', '1'))
            isDummy=bool(int(element.get('isDummy', '0')))
            Q=QueueLIFO(id, name, capacity, isDummy)
            Q.nextIds=successorList
            G.QueueList.append(Q)
            G.ObjList.append(Q)
            
        elif objClass=='Dream.Assembly':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            processingTime=element.get('processingTime', 'not found')
            distributionType=processingTime.get('distributionType', 'not found')
            mean=float(processingTime.get('mean', '0'))  
            stdev=float(processingTime.get('stdev', '0'))  
            min=float(processingTime.get('min', '0')) 
            max=float(processingTime.get('max', '0'))
            A=Assembly(id, name, distribution=distributionType, mean=mean,stdev=stdev,min=min,max=max)
            A.nextIds=getSuccessorList(id)
            G.AssemblyList.append(A)
            G.ObjList.append(A)
            
        elif objClass=='Dream.Dismantle':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            processingTime=element.get('processingTime', 'not found')
            distributionType=processingTime.get('distributionType', 'not found')
            mean=float(processingTime.get('mean', '0'))  
            stdev=float(processingTime.get('stdev', '0'))  
            min=float(processingTime.get('min', '0')) 
            max=float(processingTime.get('max', '0'))
            D=Dismantle(id, name, distribution=distributionType, mean=mean,stdev=stdev,min=min,max=max)
            # get the successorList for the 'Parts'
            D.nextPartIds=getSuccessorList(id, lambda source, destination, edge_data: edge_data.get('entity') == 'Part')
            # get the successorList for the 'Frames'
            D.nextFrameIds=getSuccessorList(id, lambda source, destination, edge_data: edge_data.get('entity') == 'Frame')
            D.nextIds=getSuccessorList(id)
            G.DismantleList.append(D)
            G.ObjList.append(D)
            
        elif objClass=='Dream.Conveyer':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            length=float(element.get('length', '10'))
            speed=float(element.get('speed', '1'))
            C=Conveyer(id, name, length, speed)
            C.nextIds=getSuccessorList(id)
            G.ObjList.append(C)
            G.ConveyerList.append(C)
            
        elif objClass=='Dream.Job':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            priority=int(element.get('priority', '0'))
            dueDate=float(element.get('dueDate', '0'))
            orderDate=float(element.get('orderDate', '0'))
            JSONRoute=element.get('route', [])                  # dummy variable that holds the routes of the jobs
                                                                #    the route from the JSON file 
                                                                #    is a sequence of dictionaries
            route = [None for i in range(len(JSONRoute))]       # variable that holds the argument used in the Job initiation
                                                                #    hold None for each entry in the 'route' list
            
            for routeElement in JSONRoute:                                          # for each 'step' dictionary in the JSONRoute
                stepNumber=int(routeElement.get('stepNumber', '0'))                 #    get the stepNumber
                nextId=routeElement.get('stationId', 'not found')                   #    the stationId
                processingTime=routeElement.get('processingTime', 'not found')      # and the 'processingTime' dictionary
                distributionType=processingTime.get('distributionType', 'not found')# and from that dictionary 
                                                                                    #    get the 'mean' 
                mean=float(processingTime.get('mean', 'not found'))
                route[stepNumber]=[nextId, mean]                                    # finally add the 'nextId' and 'mean'
                                                                                    #     to the job route
            # initiate the job
            J=Job(id, name, route, priority=priority, dueDate=dueDate, orderDate=orderDate)
            G.JobList.append(J)   
            G.WipList.append(J)  
            G.EntityList.append(J)       
            
        elif objClass=='Dream.BatchDecomposition':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            processingTime=element.get('processingTime', 'not found')
            distributionType=processingTime.get('distributionType', 'not found')
            mean=float(processingTime.get('mean', '0'))  
            stdev=float(processingTime.get('stdev', '0'))  
            min=float(processingTime.get('min', '0')) 
            max=float(processingTime.get('max', '0'))
            numberOfSubBatches=int(element.get('numberOfSubBatches', '0'))
            BD=BatchDecomposition(id, name, distribution=distributionType,  numberOfSubBatches=numberOfSubBatches,
                                                    mean=mean,stdev=stdev,min=min,max=max)
            BD.nextIds=getSuccessorList(id)
            G.BatchDecompositionList.append(BD)
            G.ObjList.append(BD)       
            
        elif objClass=='Dream.BatchReassembly':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            processingTime=element.get('processingTime', 'not found')
            distributionType=processingTime.get('distributionType', 'not found')
            mean=float(processingTime.get('mean', '0'))  
            stdev=float(processingTime.get('stdev', '0'))  
            min=float(processingTime.get('min', '0')) 
            max=float(processingTime.get('max', '0'))
            numberOfSubBatches=int(element.get('numberOfSubBatches', '0'))
            BR=BatchReassembly(id, name, distribution=distributionType,  numberOfSubBatches=numberOfSubBatches,
                                                    mean=mean,stdev=stdev,min=min,max=max)
            BR.nextIds=getSuccessorList(id)
            G.BatchReassemblyList.append(BR)
            G.ObjList.append(BR)       
            
        elif objClass=='Dream.LineClearance':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            capacity=int(element.get('capacity', '1'))
            isDummy=bool(int(element.get('isDummy', '0')))
            schedulingRule=element.get('schedulingRule', 'FIFO')
            LC=LineClearance(id, name, capacity, isDummy, schedulingRule=schedulingRule)
            LC.nextIds=getSuccessorList(id)
            G.LineClearanceList.append(LC)
            G.ObjList.append(LC)
    
    # -----------------------------------------------------------------------
    #                    loop through all the core objects    
    #                         to read predecessors
    # -----------------------------------------------------------------------
    for element in G.ObjList:
        #loop through all the nextIds of the object
        for nextId in element.nextIds:
            #loop through all the core objects to find the on that has the id that was read in the successorList
            for possible_successor in G.ObjList:
                if possible_successor.id==nextId:
                    possible_successor.previousIds.append(element.id)            


# ===========================================================================
#    defines the topology (predecessors and successors for all the objects)
# ===========================================================================
def setTopology():
    #loop through all the objects  
    for element in G.ObjList:
        next=[]
        previous=[]
        for j in range(len(element.previousIds)):
            for q in range(len(G.ObjList)):
                if G.ObjList[q].id==element.previousIds[j]:
                    previous.append(G.ObjList[q])
                    
        for j in range(len(element.nextIds)):
            for q in range(len(G.ObjList)):
                if G.ObjList[q].id==element.nextIds[j]:
                    next.append(G.ObjList[q])      
                             
        if element.type=="Source":
            element.defineRouting(next)
        elif element.type=="Exit":
            element.defineRouting(previous)
        #Dismantle should be changed to identify what the the successor is.
        #nextPart and nextFrame will become problematic    
        elif element.type=="Dismantle":
            nextPart=[]
            nextFrame=[]
            for j in range(len(element.nextPartIds)):
                for q in range(len(G.ObjList)):
                    if G.ObjList[q].id==element.nextPartIds[j]:
                        nextPart.append(G.ObjList[q])
            for j in range(len(element.nextFrameIds)):
                for q in range(len(G.ObjList)):
                    if G.ObjList[q].id==element.nextFrameIds[j]:
                        nextFrame.append(G.ObjList[q])
            element.defineRouting(previous, next)            
            element.definePartFrameRouting(nextPart, nextFrame)
        else:
            element.defineRouting(previous, next)

# ===========================================================================
#        reads the scheduling rules from the ant and apply them to Queues
# ===========================================================================
def setQueuesSchedulingRules():
    jsonData=json.loads(G.AntData)
    nodes = jsonData['nodes']
    for id in nodes:
        for Q in G.QueueList:
            if Q.id==id:
                currentQ=Q
        queueData=nodes[id]
        schedulingRule=queueData['schedulingRule']
        currentQ.schedulingRule=schedulingRule

         
# ===========================================================================
#        used to convert a string read from the input to object type
# ===========================================================================
def str_to_class(str):
    return getattr(sys.modules[__name__], str)

# ===========================================================================
#            initializes all the objects that are in the topology
# ===========================================================================
def initializeObjects():
    for element in G.ObjList:
        element.initialize()
    for repairman in G.RepairmanList:
        repairman.initialize()
    for entity in G.EntityList:
        entity.initialize()

# ===========================================================================
#                        activates all the objects
# ===========================================================================
def activateObjects():
    for element in G.ObjList:
        try:
            activate(element, element.run())
        except AttributeError:
            pass

# ===========================================================================
#                sets the WIP in the corresponding stations
# ===========================================================================
def setWIP():
    #read the start station of the Entities and assign them to it
    for entity in G.WipList:
        objectId=entity.currentStation                      # get the id of the object where the entity currently seats 
        object=None
        for obj in G.ObjList:
            if obj.id==objectId:  
                object=obj                                  # find the object in the 'G.ObjList
        object.getActiveObjectQueue().append(entity)        # append the entity to its Queue
        entity.remainingRoute[0][0]=""                      # remove data from the remaining route.    
        entity.schedule.append([object,now()])   #append the time to schedule so that it can be read in the result
        entity.currentStation=object                        # update the current station of the entity           

# ===========================================================================
#                        the main script that is ran
# ===========================================================================
def main(modelJSON, antJSON):
    #argv = argv or sys.argv[1:]
    
    #create an empty list to store all the objects in   
    G.ObjList=[]
    
    #input data and sched rules data
    G.InputData=modelJSON
    G.AntData=antJSON
    start=time.time()                               # start counting execution time 

    #read the input from the JSON file and create the line
    G.JSONData=json.loads(G.InputData)              # create the dictionary JSONData
    readGeneralInput()
    createObjects()
    setQueuesSchedulingRules()
    setTopology() 

    
    #run the experiment (replications)          
    for i in xrange(G.numberOfReplications):
        logger.info("start run number "+str(i+1)) 
        G.seed+=1
        G.Rnd=Random(G.seed) 
              
        initialize()                        #initialize the simulation 
        initializeObjects()
        setWIP()        
        activateObjects()
        
        # if the simulation is ran until no more events are scheduled, 
        # then we have to find the end time as the time the last entity ended. 
        if G.maxSimTime==-1:
            simulate(until=infinity)    # simulate until there are no more events. 
                                        # If someone does it for a model that has always events, then it will run forever!
            # identify from the exits what is the time that the last entity has ended. 
            endList=[]
            for exit in G.ExitList:
                endList.append(exit.timeLastEntityLeft)
            G.maxSimTime=float(max(endList))    
        #else we simulate until the given maxSimTime
        else:            
            simulate(until=G.maxSimTime)      #simulate until the given maxSimTime
        
        #carry on the post processing operations for every object in the topology       
        for element in G.ObjList:
            element.postProcessing()
            
        #carry on the post processing operations for every model resource in the topology       
        for model_resource in G.RepairmanList:
            model_resource.postProcessing()       
            
        #output trace to excel      
        if(G.trace=="Yes"):
            ExcelHandler.outputTrace('trace'+str(i))  
    
    G.outputJSONFile=open('outputJSON.json', mode='w')
    G.outputJSON['_class'] = 'Dream.Simulation';
    G.outputJSON['general'] ={};
    G.outputJSON['general']['_class'] = 'Dream.Configuration';
    G.outputJSON['general']['totalExecutionTime'] = (time.time()-start);
    G.outputJSON['elementList'] =[];
    
    #output data to JSON for every object in the topology         
    for element in G.ObjList:
        try:
            element.outputResultsJSON()
        except AttributeError:
            pass
        
    #output data to JSON for every resource in the topology         
    for model_resource in G.RepairmanList:
        try:
            model_resource.outputResultsJSON()
        except AttributeError:
            pass
        
    for job in G.JobList:
        job.outputResultsJSON()
         
    outputJSONString=json.dumps(G.outputJSON, indent=True)
    G.outputJSONFile.write(outputJSONString)
          
    logger.info("execution time="+str(time.time()-start))
    if modelJSON:
      return outputJSONString
    
if __name__ == '__main__':
    main()
