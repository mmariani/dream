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

from SimPy.Simulation import *
from Source import Source
from Globals import G
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
import xlwt
import xlrd
import time
import numpy as np
import json
from random import Random
import sys
import os.path

#reads general simulation inputs
def readGeneralInput():
    general=G.JSONData['general']
    G.numberOfReplications=int(general.get('numberOfReplications', '1'))
    G.maxSimTime=float(general.get('maxSimTime', '100'))
    G.trace=general.get('trace', 'No')
    G.confidenceLevel=float(general.get('confidenceLevel', '0.95'))

#creates the simulation objects
def createObjects():
    #Read the json data
    elementList = G.JSONData['elementList']
    #modelResourceList = G.JSONData['modelResource']
   
    #define the lists
    G.SourceList=[]
    G.MachineList=[]
    G.ExitList=[]
    G.QueueList=[]    
    G.RepairmanList=[]
    G.AssemblyList=[]
    G.DismantleList=[]
    G.ConveyerList=[]
    
    
    #loop through all the model resources 
    #search for repairmen in order to create them
    #read the data and create them
    for element in elementList:
        resourceClass = element.get('_class', 'not found')
        if resourceClass=='Dream.Repairman':
            id = element.get('id', 'not found')
            name = element.get('name', 'not found')
            capacity = int(element.get('capacity', '1'))
            successorList=element.get('successorList', 'not found')
            R = Repairman(id, name, capacity)
            R.coreObjectIds=successorList
            G.RepairmanList.append(R)                           
    
    #loop through all the elements    
    #read the data and create them
    for element in elementList:
        objClass=element.get('_class', 'not found')   
        if objClass=='Dream.Source':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            interarrivalTime=element.get('interarrivalTime', 'not found')
            distributionType=interarrivalTime.get('distributionType', 'not found')
            mean=float(interarrivalTime.get('mean', '0'))        
            entity=str_to_class(element.get('entity', 'not found'))
            successorList=element.get('successorList', 'not found')            
            S=Source(id, name, distributionType, mean, entity)
            S.nextIds=successorList
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
            for repairman in G.RepairmanList:
                if(id in repairman.coreObjectIds):
                    r=repairman
                    
            successorList=element.get('successorList', 'not found')
            M=Machine(id, name, 1, distributionType, [mean,stdev,min,max], failureDistribution,
                                                    MTTF, MTTR, availability, r)
            M.nextIds=successorList
            G.MachineList.append(M)
            G.ObjList.append(M)
            
        elif objClass=='Dream.Exit':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            E=Exit(id, name)
            G.ExitList.append(E)
            G.ObjList.append(E)
            
        elif objClass=='Dream.Queue':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            successorList=element.get('successorList', 'not found')
            capacity=int(element.get('capacity', '1'))
            isDummy=bool(int(element.get('isDummy', '0')))
            Q=Queue(id, name, capacity, isDummy)
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
            #predecessorPartList=element.get('predecessorPartList', 'not found')
            #predecessorFrameList=element.get('predecessorFrameList', 'not found')
            successorList=element.get('successorList', 'not found')
            A=Assembly(id, name, distributionType, [mean,stdev,min,max])
            #A.previousPartIds=predecessorPartList
            #A.previousFrameIds=predecessorFrameList
            A.nextIds=successorList
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
            successorList=element.get('successorList', 'not found')
            successorPartList=element.get('successorPartList', 'not found')
            successorFrameList=element.get('successorFrameList', 'not found')
            D=Dismantle(id, name, distributionType, [mean,stdev,min,max])
            D.nextPartIds=successorPartList
            D.nextFrameIds=successorFrameList
            D.nextIds=successorList
            G.DismantleList.append(D)
            G.ObjList.append(D)
            
        elif objClass=='Dream.Conveyer':
            id=element.get('id', 'not found')
            name=element.get('name', 'not found')
            length=float(element.get('length', '10'))
            speed=float(element.get('speed', '1'))
            successorList=element.get('successorList', 'not found')
            C=Conveyer(id, name, length, speed)
            C.nextIds=successorList
            G.ObjList.append(C)
            G.ConveyerList.append(C)
            
    #loop through all the core objects    
    #to read predecessors
    for element in G.ObjList:
        #loop through all the nextIds of the object
        for nextId in element.nextIds:
            #loop through all the core objects to find the on that has the id that was read in the successorList
            for possible_successor in G.ObjList:
                if possible_successor.id==nextId:
                    possible_successor.previousIds.append(element.id)            

#defines the topology (predecessors and successors for all the objects)
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

#used to convert a string read from the input to object type
def str_to_class(str):
    return getattr(sys.modules[__name__], str)

#initializes all the objects that are in the topology
def initializeObjects():
    for element in G.ObjList:
        element.initialize()
    for repairman in G.RepairmanList:
        repairman.initialize()

#activates all the objects    
def activateObjects():
    for element in G.ObjList:
        try:
            activate(element, element.run())
        except AttributeError:
            pass

#the main script that is ran
def main(argv=[], input_data=None):
    argv = argv or sys.argv[1:]

    #create an empty list to store all the objects in   
    G.ObjList=[]

    if input_data is None:
      # user passes the topology filename as first argument to the program
      filename = argv[0]
      try:
          G.JSONFile=open(filename, "r")
      except IOError:
          print "%s could not be open" % filename
          return "ERROR"
      G.InputData=G.JSONFile.read()
    else:
      G.InputData = input_data

    start=time.time()   #start counting execution time 

    #read the input from the JSON file and create the line
    G.JSONData=json.loads(G.InputData)
    readGeneralInput()
    createObjects()
    setTopology() 

    
    #run the experiment (replications)          
    for i in xrange(G.numberOfReplications):
        print "start run number "+str(i+1) 
        G.seed+=1
        G.Rnd=Random(G.seed) 
              
        initialize()                        #initialize the simulation 
        initializeObjects()
        activateObjects()
                            
        simulate(until=G.maxSimTime)      #start the simulation
        
        #carry on the post processing operations for every object in the topology       
        for element in G.ObjList:
            element.postProcessing(G.maxSimTime)
            
        #carry on the post processing operations for every model resource in the topology       
        for model_resource in G.RepairmanList:
            model_resource.postProcessing(G.maxSimTime)          
    
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
         
    outputJSONString=str(str(G.outputJSON))
    outputJSONString=outputJSONString.replace("'", '"')
    G.outputJSONFile.write(str(outputJSONString))
    
    print "execution time="+str(time.time()-start)  
    if input_data:
      return outputJSONString
    
if __name__ == '__main__':
    main()

