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
Created on 29 Oct 2013

@author: Ioannis
'''
'''
BatchDecomposition is a Core Object that takes a batch and decomposes to sub-batches
'''


from SimPy.Simulation import Process, Resource
from SimPy.Simulation import activate, waituntil, now, hold

from CoreObject import CoreObject

from RandomNumberGenerator import RandomNumberGenerator
import scipy.stats as stat

from Entity import Entity
from SubBatch import SubBatch
from Batch import Batch

from Globals import G

# ===========================================================================
# the Batch-Decomposition Object
# ===========================================================================
class BatchDecomposition(CoreObject):
    # =======================================================================
    #initialize the id, the capacity of the object and the distribution
    # =======================================================================        
    def __init__(self, id, name, numberOfSubBatches=1, distribution='Fixed', \
                 mean=1, stdev=0, min=0, max=10,operator='None'):
        Process.__init__(self)
        # hold the id, name, and type of the Machine instance
        self.id=id
        self.objName=name
        self.type="BatchDecomposition"              #String that shows the type of object
        # holds the capacity of the object 
        self.numberOfSubBatches=numberOfSubBatches
        # define the distribution types of the processing and failure times respectively
        self.distType=distribution                  #the distribution that the procTime follows      
        # sets the operator resource of the Machine
        self.operator=operator         
        # Sets the attributes of the processing (and failure) time(s)
        self.rng=RandomNumberGenerator(self, self.distType)
        self.rng.avg=mean
        self.rng.stdev=stdev
        self.rng.min=min
        self.rng.max=max
        # for routing purposes 
        self.next=[]                                #list with the next objects in the flow
        self.previous=[]                            #list with the previous objects in the flow
        self.nextIds=[]                             #list with the ids of the next objects in the flow
        self.previousIds=[]                         #list with the ids of the previous objects in the flow

    # =======================================================================
    #     initialize the internal resource of the object
    # =======================================================================
    def initialize(self):
        from Globals import G
        G.BatchWaitingList = []                     # batches waiting to be reassembled
        CoreObject.initialize(self)                 # using the default CoreObject Functionality
        self.Res=Resource(self.numberOfSubBatches)  # initialize the Internal resource (Queue) functionality
            
    
    def run(self):
        activeObjectQueue=self.getActiveObjectQueue()
        
        while 1:  
            yield waituntil, self, self.canAcceptAndIsRequested     #wait until the Queue can accept an entity
                                                                    #and one predecessor requests it                                                  
            ent=self.getEntity()                                       
            
            # self.outputTrace("got into "+self.objName)
            
            # set the currentEntity as the Entity just received and initialize the timer timeLastEntityEntered
            self.currentEntity=self.getActiveObjectQueue()[0]       # entity is the current entity processed in Machine
            self.nameLastEntityEntered=self.currentEntity.name      # this holds the name of the last entity that got into Machine                   
            self.timeLastEntityEntered=now()                        #this holds the last time that an entity got into Machine  
            
            yield hold,self,self.calculateProcessingTime()
            self.decompose()
        
        
    def decompose(self):                #, activeEntity=None):
        # maybe I can use as argument the activeEntity passing the getEntity as argument to this function in the run function
        # for example
        # self.decompose(self.getEntity)
#         assert activeEntity!=none, 'decompose method cannot decompose None'
        activeObject = self.getActiveObject()
        activeObjectQueue=activeObject.getActiveObjectQueue()    #get the internal queue of the active core object
        activeEntity = activeObjectQueue.pop()
        G.BatchWaitingList.append(activeEntity)                 # this batch has to be reassembled by the method reassemble
        numberOfSubBatchUnits = activeEntity.numberOfUnits/self.numberOfSubBatches 
        for i in range(self.numberOfSubBatches):
            subBatch=SubBatch(str(activeEntity.id)+'_'+str(i), activeEntity.name+"_SB_"\
                              +str(i), activeEntity.id, numberOfUnits=numberOfSubBatchUnits)    #create the sub-batch
            activeObjectQueue.append(subBatch)                          #append the sub-batch to the active object Queue
            activeEntity.subBatchList.append(subBatch)
        activeEntity.numberOfSubBatches=self.numberOfSubBatches  

        
        
    def canAccept(self,callerObject=None):
        activeObject=self.getActiveObject()
        activeObjectQueue=self.getActiveObjectQueue()
        giverObject=self.getGiverObject()
        if(len(activeObject.previous)==1 or callerObject==None):      
            return activeObject.Up and len(activeObjectQueue)==0
        thecaller=callerObject
        # return True ONLY if the length of the activeOjbectQue is smaller than
        # the object capacity, and the callerObject is not None but the giverObject
        return len(activeObjectQueue)==0 and (thecaller is giverObject)
    
    
    def haveToDispose(self,callerObject=None):
        # get active and the receiver object
        activeObject=self.getActiveObject()
        activeObjectQueue=self.getActiveObjectQueue()    
        receiverObject=activeObject.getReceiverObject() 
        #if we have only one successor just check if object waits to dispose and also is up
        # this is done to achieve better (cpu) processing time        
        if(len(activeObject.next)==1 or callerObject==None): 
            return len(activeObjectQueue)>0 and activeObjectQueue[0].type!="Batch"
        
        thecaller=callerObject
        #give the entity to the successor that is waiting for the most time. 
        #plant does not do this in every occasion!       
        maxTimeWaiting=0     
        i=0                                                         # loop through the object in the successor list
        for object in activeObject.next:
            if(object.canAccept()):                                 # if the object can accept
                timeWaiting=now()-object.timeLastEntityLeft         # compare the time that it has been waiting 
                if(timeWaiting>maxTimeWaiting or maxTimeWaiting==0):# with the others'
                    maxTimeWaiting=timeWaiting
                    self.successorIndex=i                           # and update the successorIndex to the index of this object
            i+=1
              
        #return true only to the predecessor from which the queue will take 
        receiverObject=activeObject.getReceiverObject()
        return len(self.Res.activeQ)==self.numberOfSubBatches and \
            (thecaller is receiverObject) and activeObjectQueue[0].type!="Batch"
            
            
    def canAcceptAndIsRequested(self):
        # get the active and the giver objects
        activeObject=self.getActiveObject()
        activeObjectQueue=self.getActiveObjectQueue()
        giverObject=self.getGiverObject()
        
        #if we have only one predecessor just check if there is a place available and the predecessor has an entity to dispose
        if(len(activeObject.previous)==1):
            return self.canAccept(self) and giverObject.haveToDispose(activeObject) 
    
        isRequested=False               # dummy boolean variable to check if any predecessor has something to hand in
        maxTimeWaiting=0                # dummy timer to check which predecessor has been waiting the most
        
        #loop through the predecessors to see which have to dispose and which is the one blocked for longer
        i=0                                                         # loop through all the predecessors
        for object in activeObject.previous:
            if(object.haveToDispose(activeObject)):                 # if they have something to dispose off
                isRequested=True                                    # then the Queue is requested to handle the entity
                if(object.downTimeInTryingToReleaseCurrentEntity>0):# if the predecessor has failed wile waiting 
                    timeWaiting=now()-object.timeLastFailureEnded   # then update according the timeWaiting to be compared with the ones
                else:                                               # of the other machines
                    timeWaiting=now()-object.timeLastEntityEnded
                
                #if more than one predecessor have to dispose take the part from the one that is blocked longer
                if(timeWaiting>=maxTimeWaiting):                    
                    activeObject.predecessorIndex=i  
                    maxTimeWaiting=timeWaiting                   
            i+=1                                                    # pick the predecessor waiting the more
        return self.canAccept(self) and isRequested 
        # return true when the Queue is not fully occupied and a predecessor is requesting it