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
Created on 21 May 2013

@author: George
'''
'''
Models a dicmantle object 
it gathers frames that have parts loaded, unloads the parts and sends the frame to one destination and the parts to another
'''

from SimPy.Simulation import Process, Resource
from SimPy.Simulation import waituntil, now, hold, infinity
import xlwt
from RandomNumberGenerator import RandomNumberGenerator
from CoreObject import CoreObject

# ===========================================================================
# the Dismantle object
# ===========================================================================
class Dismantle(CoreObject):
    class_name = 'Dream.Dismantle'
    # =======================================================================
    # initialize the object
    # =======================================================================
    def __init__(self, id, name, distribution='Fixed', mean=1, stdev=0.1, min=0, max=5):
        CoreObject.__init__(self, id, name)
        self.type="Dismantle"   #String that shows the type of object
        self.distType=distribution          #the distribution that the procTime follows  
        self.rng=RandomNumberGenerator(self, self.distType)
        self.rng.mean=mean
        self.rng.stdev=stdev
        self.rng.min=min
        self.rng.max=max                    
        self.previous=[]        #list with the previous objects in the flow
        self.previousIds=[]     #list with the ids of the previous objects in the flow
        self.nextPart=[]    #list with the next objects that receive parts
        self.nextFrame=[]    #list with the next objects that receive frames 
        self.nextIds=[]     #list with the ids of the next objects in the flow
        self.nextPartIds=[]     #list with the ids of the next objects that receive parts 
        self.nextFrameIds=[]     #list with the ids of the next objects that receive frames 
        self.next=[]
        
        #lists to hold statistics of multiple runs
        self.Waiting=[]
        self.Working=[]
        self.Blockage=[]
        
        # variable that is used for the loading of machines 
        self.exitAssignedToReceiver = False             # by default the objects are not blocked 
                                                        # when the entities have to be loaded to operatedMachines
                                                        # then the giverObjects have to be blocked for the time
                                                        # that the machine is being loaded 

    # =======================================================================
    # the initialize method
    # =======================================================================  
    def initialize(self):
        Process.__init__(self)
        CoreObject.initialize(self)
        self.waitToDispose=False    #flag that shows if the object waits to dispose an entity    
        self.waitToDisposePart=False    #flag that shows if the object waits to dispose a part   
        self.waitToDisposeFrame=False    #flag that shows if the object waits to dispose a frame   
        
        self.Up=True                    #Boolean that shows if the object is in failure ("Down") or not ("up")
        self.currentEntity=None      
          
        self.totalFailureTime=0         #holds the total failure time
        self.timeLastFailure=0          #holds the time that the last failure of the object started
        self.timeLastFailureEnded=0          #holds the time that the last failure of the object Ended
        self.downTimeProcessingCurrentEntity=0  #holds the time that the object was down while processing the current entity
        self.downTimeInTryingToReleaseCurrentEntity=0 #holds the time that the object was down while trying 
                                                      #to release the current entity  
        self.downTimeInCurrentEntity=0                  #holds the total time that the object was down while holding current entity
        self.timeLastEntityLeft=0        #holds the last time that an entity left the object
                                                
        self.processingTimeOfCurrentEntity=0        #holds the total processing time that the current entity required                                               
                                                      
        self.totalBlockageTime=0        #holds the total blockage time
        self.totalWaitingTime=0         #holds the total waiting time
        self.totalWorkingTime=0         #holds the total working time
        self.completedJobs=0            #holds the number of completed jobs   
        
        self.timeLastEntityEnded=0      #holds the last time that an entity ended processing in the object     
        self.timeLastEntityEntered=0      #holds the last time that an entity ended processing in the object   
        self.timeLastFrameWasFull=0     #holds the time that the last frame was full, ie that assembly process started  
        self.nameLastFrameWasFull=""    #holds the name of the last frame that was full, ie that assembly process started
        self.nameLastEntityEntered=""   #holds the name of the last frame that entered processing in the object
        self.nameLastEntityEnded=""     #holds the name of the last frame that ended processing in the object            
        self.Res=Resource(capacity=infinity)    
        self.Res.activeQ=[]  
        self.Res.waitQ=[]  
        
    # =======================================================================
    # the run method
    # =======================================================================
    def run(self):
        while 1:
            yield waituntil, self, self.canAcceptAndIsRequested     #wait until the Assembly can accept a frame
                                                                    #and one "frame" giver requests it   
            self.getEntity()                                 #get the Frame with the parts 
            self.timeLastEntityEntered=now()
                        
            startWorkingTime=now()   
            
            self.totalProcessingTimeInCurrentEntity=self.calculateProcessingTime()   
            yield hold,self,self.totalProcessingTimeInCurrentEntity   #hold for the time the assembly operation is carried    

            self.totalWorkingTime+=now()-startWorkingTime
            
            self.timeLastEntityEnded=now()
                      
            startBlockageTime=now()          
            self.waitToDisposePart=True     #Dismantle is in state to dispose a part
            yield waituntil, self, self.frameIsEmpty       #wait until all the parts are disposed
            self.waitToDisposePart=False     #Dismantle has no parts now
            self.waitToDisposeFrame=True     #Dismantle is in state to dispose a part
            yield waituntil, self, self.isEmpty       #wait until all the frame is disposed            
                        
            self.completedJobs+=1                       #Dismantle completed a job            
            self.waitToDisposeFrame=False                     #the Dismantle has no Frame to dispose now
            #self.totalBlockageTime+=now()-startBlockageTime     #add the blockage time
            
    # =======================================================================
    #    checks if the Dismantle can accept an entity and there is a Frame 
    #                             waiting for it
    # =======================================================================
    def canAcceptAndIsRequested(self):
        return len(self.getActiveObjectQueue())==0 and self.getGiverObject().haveToDispose(self)  
    
    # =======================================================================
    # checks if the Dismantle can accept an entity 
    # =======================================================================
    def canAccept(self, callerObject=None):
        return len(self.getActiveObjectQueue())==0  
    
    # =======================================================================
    # defines where parts and frames go after they leave the object
    # =======================================================================               
    def definePartFrameRouting(self, successorPartList=[], successorFrameList=[]):
        self.nextPart=successorPartList
        self.nextFrame=successorFrameList              
    
    # =======================================================================
    # checks if the caller waits for a part or a frame and if the Dismantle 
    # is in the state of disposing one it returnse true
    # =======================================================================     
    def haveToDispose(self, callerObject=None): 

        thecaller=callerObject
        
        #according to the caller return true or false
        if thecaller in self.nextPart:
            if len(self.getActiveObjectQueue())>1 and self.waitToDisposePart:
                self.receiver=thecaller
                return True
        elif thecaller in self.nextFrame:
            if len(self.getActiveObjectQueue())==1 and self.waitToDisposeFrame:
                self.receiver=thecaller
                return True
        return False
    
    # =======================================================================
    # checks if the frame is emptied
    # =======================================================================
    def frameIsEmpty(self):
        return len(self.getActiveObjectQueue())==1
    
    # =======================================================================
    # checks if Dismantle is emptied
    # =======================================================================
    def isEmpty(self):
        return len(self.getActiveObjectQueue())==0
    
    # =======================================================================
    # gets a frame from the giver 
    # =======================================================================
    def getEntity(self):
        activeEntity=CoreObject.getEntity(self)     #run the default method
        activeObjectQueue=self.getActiveObjectQueue()
        #get also the parts of the frame so that they can be popped
        for part in activeEntity.getFrameQueue():         
            activeObjectQueue.append(part)
            part.currentStation=self
        activeEntity.getFrameQueue=[]           #empty the frame
        
        #move the frame to the end of the internal queue since we want the frame to be disposed first
        activeObjectQueue.append(activeEntity)
        activeObjectQueue.pop(0)        
        return activeEntity
    
    # =======================================================================
    # removes an entity from the Dismantle
    # =======================================================================
    def removeEntity(self, entity=None):
        activeObjectQueue=self.getActiveObjectQueue()
        activeEntity=CoreObject.removeEntity(self, entity)  #run the default method 
        
        #update the flags
        if(len(activeObjectQueue)==0):  
            self.waitToDisposeFrame=False
        else:
            if(len(activeObjectQueue)==1):   
               self.waitToDisposePart=False
        return activeEntity
    
    # =======================================================================
    # add the blockage only if the very last Entity (Frame) is to depart
    # =======================================================================
    def addBlockage(self):
        if len(self.getActiveObjectQueue())==1:
            self.totalTimeInCurrentEntity=now()-self.timeLastEntityEntered
            self.totalTimeWaitingForOperator += self.operatorWaitTimeCurrentEntity 
            blockage=now()-(self.timeLastEntityEnded+self.downTimeInTryingToReleaseCurrentEntity)       
            self.totalBlockageTime+=blockage
        
    # =======================================================================
    # actions to be taken after the simulation ends
    # =======================================================================
    def postProcessing(self, MaxSimtime=None):
        if MaxSimtime==None:
            from Globals import G
            MaxSimtime=G.maxSimTime
        
        #if there is an entity that finished processing in Dismantle but did not get to reach 
        #the following Object
        #till the end of simulation, we have to add this blockage to the percentage of blockage in Dismantle
        if (len(self.Res.activeQ)>0) and (self.waitToDisposeFrame) or (self.waitToDisposePart):         
            self.totalBlockageTime+=now()-self.timeLastEntityEnded       
        
        #if Dismantle is currently processing an entity we should count this working time    
        if(len(self.Res.activeQ)>0) and (not ((self.waitToDisposeFrame) or (self.waitToDisposePart))):       
            self.totalWorkingTime+=now()-self.timeLastEntityEntered
        
        self.totalWaitingTime=MaxSimtime-self.totalWorkingTime-self.totalBlockageTime 

                
        self.Waiting.append(100*self.totalWaitingTime/MaxSimtime)
        self.Working.append(100*self.totalWorkingTime/MaxSimtime)
        self.Blockage.append(100*self.totalBlockageTime/MaxSimtime)

    # =======================================================================
    #                  outputs message to the trace.xls. 
    #       Format is (Simulation Time | Entity or Frame Name | message)
    # =======================================================================
    def outputTrace(self, name, message):
        from Globals import G
        if(G.trace=="Yes"):         #output only if the user has selected to
            #handle the 3 columns
            G.traceSheet.write(G.traceIndex,0,str(now()))
            G.traceSheet.write(G.traceIndex,1,name)  
            G.traceSheet.write(G.traceIndex,2,message)          
            G.traceIndex+=1       #increment the row
            #if we reach row 65536 we need to create a new sheet (excel limitation)  
            if(G.traceIndex==65536):
                G.traceIndex=0
                G.sheetIndex+=1
                G.traceSheet=G.traceFile.add_sheet('sheet '+str(G.sheetIndex), cell_overwrite_ok=True)  

    # =======================================================================
    # outputs data to "output.xls"
    # =======================================================================
    def outputResultsXL(self, MaxSimtime=None):
        from Globals import G
        from Globals import getConfidenceIntervals
        if MaxSimtime==None:
            MaxSimtime=G.maxSimTime
        if(G.numberOfReplications==1): #if we had just one replication output the results to excel
            G.outputSheet.write(G.outputIndex,0, "The percentage of Working of "+self.objName +" is:")
            G.outputSheet.write(G.outputIndex,1,100*self.totalWorkingTime/MaxSimtime)
            G.outputIndex+=1
            G.outputSheet.write(G.outputIndex,0, "The percentage of Blockage of "+self.objName +" is:")
            G.outputSheet.write(G.outputIndex,1,100*self.totalBlockageTime/MaxSimtime)
            G.outputIndex+=1   
            G.outputSheet.write(G.outputIndex,0, "The percentage of Waiting of "+self.objName +" is:")
            G.outputSheet.write(G.outputIndex,1,100*self.totalWaitingTime/MaxSimtime)
            G.outputIndex+=1   
        else:
            G.outputSheet.write(G.outputIndex,0, "CI "+str(G.confidenceLevel*100)+"% for the mean percentage of Working of "+ self.objName+" is:")
            working_ci = getConfidenceIntervals(self.Working)
            G.outputSheet.write(G.outputIndex, 1, working_ci['min'])
            G.outputSheet.write(G.outputIndex, 2, working_ci['avg'])
            G.outputSheet.write(G.outputIndex, 3, working_ci['max'])
            G.outputIndex+=1

            G.outputSheet.write(G.outputIndex,0, "CI "+str(G.confidenceLevel*100)+"% for the mean percentage of Blockage of "+ self.objName+" is:")
            blockage_ci = getConfidenceIntervals(self.Blockage)
            G.outputSheet.write(G.outputIndex, 1, blockage_ci['min'])
            G.outputSheet.write(G.outputIndex, 2, blockage_ci['avg'])
            G.outputSheet.write(G.outputIndex, 3, blockage_ci['max'])
            G.outputIndex+=1

            G.outputSheet.write(G.outputIndex,0, "CI "+str(G.confidenceLevel*100)+"% for the mean percentage of Waiting of "+ self.objName+" is:")
            waiting_ci = getConfidenceIntervals(self.Waiting)
            G.outputSheet.write(G.outputIndex, 1, waiting_ci['min'])
            G.outputSheet.write(G.outputIndex, 2, waiting_ci['avg'])
            G.outputSheet.write(G.outputIndex, 3, waiting_ci['max'])
            G.outputIndex+=1
        G.outputIndex+=1

    # =======================================================================
    # outputs results to JSON File
    # =======================================================================
    def outputResultsJSON(self):
        from Globals import G
        from Globals import getConfidenceIntervals
        json = {'_class': self.class_name,
                'id': self.id,
                'results': {}}
        if(G.numberOfReplications==1):
            json['results']['working_ratio']=100*self.totalWorkingTime/G.maxSimTime
            json['results']['blockage_ratio']=100*self.totalBlockageTime/G.maxSimTime
            json['results']['waiting_ratio']=100*self.totalWaitingTime/G.maxSimTime
        else:
            json['results']['working_ratio'] = getConfidenceIntervals(self.Working)
            json['results']['blockage_ratio'] = getConfidenceIntervals(self.Blockage)
            json['results']['waiting_ratio'] = getConfidenceIntervals(self.Waiting)
        G.outputJSON['elementList'].append(json)
