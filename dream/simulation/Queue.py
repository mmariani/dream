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
Created on 8 Nov 2012

@author: George
'''
'''
Models a FIFO queue where entities can wait in order to get into a server
'''


from SimPy.Simulation import Process, Resource
from SimPy.Simulation import waituntil, now, infinity, waitevent
from CoreObject import CoreObject
# ===========================================================================
#                            the Queue object
# ===========================================================================
class Queue(CoreObject):
    #===========================================================================
    # the __init__ method of the Queue
    #===========================================================================
    def __init__(self, id, name, capacity=1, isDummy=False, schedulingRule="FIFO"):
        CoreObject.__init__(self, id, name)
#         Process.__init__(self)
        # used for the routing of the entities
        self.predecessorIndex=0     # holds the index of the predecessor from which the Queue will take an entity next
        self.successorIndex=0       # holds the index of the successor where the Queue will dispose an entity next
        self.type="Queue"           # String that shows the type of object
        #     holds the capacity of the Queue
        if capacity>0:
            self.capacity=capacity
        else:
            self.capacity=infinity

        #     No failures are considered for the Queue        

        self.isDummy=isDummy                    #Boolean that shows if it is the dummy first Queue
        self.schedulingRule=schedulingRule      #the scheduling rule that the Queue follows
        self.multipleCriterionList=[]           #list with the criteria used to sort the Entities in the Queue
        SRlist = [schedulingRule]
        if schedulingRule.startswith("MC"):     # if the first criterion is MC aka multiple criteria
            SRlist = schedulingRule.split("-")  # split the string of the criteria (delimiter -)
            self.schedulingRule=SRlist.pop(0)   # take the first criterion of the list
            self.multipleCriterionList=SRlist   # hold the criteria list in the property multipleCriterionList
 
        for scheduling_rule in SRlist:
          if scheduling_rule not in self.getSupportedSchedulingRules():
            raise ValueError("Unknown scheduling rule %s for %s" %
              (scheduling_rule, id))

        # Will be populated by an event generator
        self.wip_stat_list = []

    @staticmethod
    def getSupportedSchedulingRules():
        return ("FIFO", "Priority", "EDD", "EOD",
            "NumStages", "RPC", "LPT", "SPT", "MS", "WINQ")
    
    #===========================================================================
    # the initialize method of the Queue class
    #===========================================================================
    def initialize(self):
        # using the Process __init__ and not the CoreObject __init__
        CoreObject.initialize(self)
        # initialise the internal Queue (type Resource) of the Queue object 
        self.Res=Resource(self.capacity)   
    
    #===========================================================================
    # run method of the queue
    #===========================================================================
    def run(self):  
        activeObjectQueue=self.getActiveObjectQueue()
        # check if there is WIP and signal receiver
        self.initialSignalReceiver()
        while 1:  
            # wait until the Queue can accept an entity and one predecessor requests it
            yield waitevent, self, [self.isRequested,self.canDispose]
            # if the event that activated the thread is isRequested then getEntity
            if self.isRequested.signalparam:
                self.getEntity()
                #if entity just got to the dummyQ set its startTime as the current time
                if self.isDummy:
                    activeObjectQueue[0].startTime=now()
                # reset the isRequested signal parameter
                self.isRequested.signalparam=None
            # if the event that activated the thread is canDispose then signalReceiver
            if self.haveToDispose():
                self.signalReceiver()
    
    # =======================================================================
    #               checks if the Queue can accept an entity       
    #             it checks also who called it and returns TRUE 
    #            only to the predecessor that will give the entity.
    # =======================================================================  
    def canAccept(self, callerObject=None): 
        # get active and giver objects
        activeObject=self.getActiveObject()
        activeObjectQueue=self.getActiveObjectQueue()
        #if we have only one predecessor just check if there is a place available
        # this is done to achieve better (cpu) processing time 
        # then we can also use it as a filter for a yield method
        if(len(activeObject.previous)==1 or callerObject==None):
            return len(activeObjectQueue)<activeObject.capacity   
        thecaller=callerObject
        return len(activeObjectQueue)<activeObject.capacity and (thecaller in activeObject.previous)
    
    # =======================================================================
    #    checks if the Queue can dispose an entity to the following object
    #            it checks also who called it and returns TRUE 
    #           only to the receiver that will give the entity. 
    #              this is kind of slow I think got to check   
    # =======================================================================
    def haveToDispose(self, callerObject=None): 
        # get active object and its queue
        activeObject=self.getActiveObject()
        activeObjectQueue=self.getActiveObjectQueue()     
        
        #if we have only one possible receiver just check if the Queue holds one or more entities
        if(len(activeObject.next)==1 or callerObject==None):
            return len(activeObjectQueue)>0 
         
        thecaller=callerObject
        return len(activeObjectQueue)>0 and (thecaller in activeObject.next)
    
    # =======================================================================
    #                    removes an entity from the Object
    # =======================================================================
    def removeEntity(self, entity=None):        
        activeObject=self.getActiveObject()                                  
        activeEntity=CoreObject.removeEntity(self, entity)                  #run the default method
        if self.canAccept():
            self.signalGiver()
        return activeEntity
    
    # =======================================================================
    #            checks if the Queue can accept an entity and 
    #        there is an entity in some predecessor waiting for it
    #   also updates the predecessorIndex to the one that is to be taken
    # =======================================================================
    def canAcceptAndIsRequested(self):
        # get the active and the giver objects
        activeObject=self.getActiveObject()
        activeObjectQueue=self.getActiveObjectQueue()
        giverObject=self.getGiverObject()
        return len(activeObjectQueue)<self.capacity and giverObject.haveToDispose(activeObject) 
    
    
    # =======================================================================
    #            gets an entity from the predecessor that 
    #                the predecessor index points to
    # =======================================================================     
    def getEntity(self):
        activeEntity=CoreObject.getEntity(self)  #run the default behavior 
        return activeEntity
            
    # =======================================================================
    #    sorts the Entities of the Queue according to the scheduling rule
    # =======================================================================
    def sortEntities(self):
        #if we have sorting according to multiple criteria we have to call the sorter many times
        if self.schedulingRule=="MC":
            for criterion in reversed(self.multipleCriterionList):
               self.activeQSorter(criterion=criterion) 
        #else we just use the default scheduling rule
        else:
            self.activeQSorter()
            
    # =======================================================================
    #    sorts the Entities of the Queue according to the scheduling rule
    # =======================================================================
    def activeQSorter(self, criterion=None):
        activeObjectQ=self.Res.activeQ
        if criterion==None:
            criterion=self.schedulingRule           
        #if the schedulingRule is first in first out
        if criterion=="FIFO": 
            pass
        #if the schedulingRule is based on a pre-defined priority
        elif criterion=="Priority":
            activeObjectQ.sort(key=lambda x: x.priority)
        #if the schedulingRule is earliest due date
        elif criterion=="EDD":
            activeObjectQ.sort(key=lambda x: x.dueDate)   
        #if the schedulingRule is earliest order date
        elif criterion=="EOD":
            activeObjectQ.sort(key=lambda x: x.orderDate)      
        #if the schedulingRule is to sort Entities according to the stations they have to visit
        elif criterion=="NumStages":
            activeObjectQ.sort(key=lambda x: len(x.remainingRoute), reverse=True)  
        #if the schedulingRule is to sort Entities according to the their remaining processing time in the system
        elif criterion=="RPC":
            for entity in activeObjectQ:
                RPT=0
                for step in entity.remainingRoute:
                    processingTime=step.get('processingTime',None)
                    if processingTime:
                        RPT+=float(processingTime.get('mean',0))               
                entity.remainingProcessingTime=RPT
            activeObjectQ.sort(key=lambda x: x.remainingProcessingTime, reverse=True)     
        #if the schedulingRule is to sort Entities according to longest processing time first in the next station
        elif criterion=="LPT":
            for entity in activeObjectQ:
                processingTime = entity.remainingRoute[0].get('processingTime',None)
                entity.processingTimeInNextStation=float(processingTime.get('mean',0))
                if processingTime:
                    entity.processingTimeInNextStation=float(processingTime.get('mean',0))
                else:
                    entity.processingTimeInNextStation=0
            activeObjectQ.sort(key=lambda x: x.processingTimeInNextStation, reverse=True)             
        #if the schedulingRule is to sort Entities according to shortest processing time first in the next station
        elif criterion=="SPT":
            for entity in activeObjectQ:
                processingTime = entity.remainingRoute[0].get('processingTime',None)
                if processingTime:
                    entity.processingTimeInNextStation=float(processingTime.get('mean',0))
                else:
                    entity.processingTimeInNextStation=0
            activeObjectQ.sort(key=lambda x: x.processingTimeInNextStation) 
        #if the schedulingRule is to sort Entities based on the minimum slackness
        elif criterion=="MS":
            for entity in activeObjectQ:
                RPT=0
                for step in entity.remainingRoute:
                    processingTime=step.get('processingTime',None)
                    if processingTime:
                        RPT+=float(processingTime.get('mean',0))              
                entity.remainingProcessingTime=RPT
            activeObjectQ.sort(key=lambda x: (x.dueDate-x.remainingProcessingTime))  
        #if the schedulingRule is to sort Entities based on the length of the following Queue
        elif criterion=="WINQ":
            from Globals import G
            for entity in activeObjectQ:
                nextObjIds=entity.remainingRoute[1].get('stationIdsList',[])
                for obj in G.ObjList:
                    if obj.id in nextObjIds:
                        nextObject=obj
                entity.nextQueueLength=len(nextObject.getActiveObjectQueue())           
            activeObjectQ.sort(key=lambda x: x.nextQueueLength)
        else:
            assert False, "Unknown scheduling criterion %r" % (criterion, )

    def outputResultsJSON(self):
        from Globals import G
        json = {'_class': 'Dream.%s' % self.__class__.__name__,
                'id': str(self.id), }
        # XXX this have to be updated to support multiple generations
        if G.numberOfReplications == 1 and self.wip_stat_list:
          json['wip_stat_list'] = self.wip_stat_list

        G.outputJSON['elementList'].append(json)
