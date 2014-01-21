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
Created on 15 Jan 2014

@author: Ioannis
'''
'''
Inherits from QueuePreemptive. It is the buffer before the MouldAssembly. 
Only if all the mould (order) components are present, will it be able to dispose them
'''

from QueuePreemptive import QueuePreemptive
from SimPy.Simulation import now

# ===========================================================================
# Error in the setting up of the WIP
# ===========================================================================
class NoCallerError(Exception):
    def __init__(self, callerError):
        Exception.__init__(self, callerError) 

# ===========================================================================
# the MouldAssemblyBuffer object
# ===========================================================================
class MouldAssemblyBuffer(QueuePreemptive):
    # =======================================================================
    # the __init__ function
    # =======================================================================
    def __init__(self, id, name, capacity=-1, dummy=False, schedulingRule="MAB"):
        # run the default method, change the schedulingRule to 'MAB'
        # for description, check activeQSorter function of Queue coreObject 
        QueuePreemptive.__init__(self, id, name, capacity, dummy, schedulingRule)
        
        
    # =======================================================================
    # extend he default so that it sets order.basicsEnded to 1
    # if all the mould components are present in the activeQ
    # =======================================================================
    def getEntity(self):
        activeObject = self.getActiveObject()
        activeObjectQueue = activeObject.getActiveObjectQueue()
        activeEntity=QueuePreemptive.getEntity(self)   #execute default behaviour
        # if the activeEntity is of type orderComponent
        try:
            if activeEntity.componentType=='Basic' or 'Secondary':
                activeEntity.readyForAssembly==1
            # check if all the basics have finished being processed in the previous machines
            # if the componentType of the activeEntity just received is 'Basic', 
            # go through the components of its parent order
            # and check if they are present in the activeObjectQueue
            if activeEntity.componentType=='Basic':
                # local variable to notify when all the basics are received
                allBasicsPresent = True
                # run through all the basicComponentsList
                for entity in activeEntity.order.basicComponentsList:
                    # if a basic is not present then set the local variable False and break
                    if not (entity in activeObjectQueue):
                        allBasicsPresent = False
                        break
                # if all are present then basicsEnded
                if allBasicsPresent:
                    activeEntity.order.basicsEnded = 1
            # for all the components that have the same parent Order as the activeEntity
            activeEntity.order.componentsReadyForAssembly = 1
            for entity in activeEntity.order.basicComponentsList+\
                            activeEntity.order.secondaryComponentsList:
            # if one of them has not reach the Buffer yet,
                if not entity.readyForAssembly:
            # the mould is not ready for assembly
                    activeEntity.order.componentsReadyForAssembly = 0
                    break
        # if the activeEntity is of type Mould
        except:
            pass
        return activeEntity
    
    # =======================================================================
    # checks if the Buffer can dispose an entity. 
    # Returns True only to the potential receiver
    # Returns True when all the mould components/parts reside either
    # in the internal buffer activeQ or in the callerObject's activeQ
    # =======================================================================     
    def haveToDispose(self, callerObject=None):
        # get active object and its queue
        activeObject=self.getActiveObject()
        activeObjectQueue=self.getActiveObjectQueue()
        try:
            if callerObject:
                thecaller = callerObject
            else:
                raise NoCallerError('The caller of the MouldAssemblyBuffer must be defined')
        except NoCallerError as noCaller:
            print 'No caller error: {0}'.format(noCaller)
        # check the length of the activeObjectQueue 
        # if the length is zero then no componentType or entity.type can be read
        if len(activeObjectQueue)==0:
            return False
        activeEntity = activeObjectQueue[0]                             # read the entity to be disposed
        if(len(activeObject.next)==1):  #if we have only one possible receiver 
            activeObject.receiver=activeObject.next[0]
        else:                           # otherwise,
            maxTimeWaiting=0            #give the entity to the possible receiver that is waiting for the most time.
            for object in activeObject.next:                            # loop through the object in the successor list
                if(object.canAccept(activeObject)):                     # if the object can accept
                    timeWaiting=now()-object.timeLastEntityLeft
                    if(timeWaiting>maxTimeWaiting or maxTimeWaiting==0):# check the time that it has been waiting
                        maxTimeWaiting=timeWaiting
                        activeObject.receiver=object                    # and update the receiver
        # if the receiverQueue cannot be read, return False
        try:
            receiverQueue = activeObject.receiver.getActiveObjectQueue()
        except:
            return False
        # if the successors (MouldAssembly) internal queue is empty then proceed with checking weather
        # the caller is the receiver
        if len(receiverQueue)==0:
            if activeEntity.type=='Mould':
                return thecaller is activeObject.receiver
            else:
                return thecaller is activeObject.receiver\
                        and activeEntity.order.componentsReadyForAssembly
        # otherwise, check additionally if the receiver holds orderComponents of the same order
        # TODO: should revise, this check may be redundant, as the receiver (assembler must be empty in order to start receiving
        # It is therefore needed that the control is performed by the assembler's getEntity() 
        else:
            return thecaller is activeObject.receiver\
                    and receiverQueue[0].order is activeObjectQueue[0].order\
                    and activeEntity.order.componentsReadyForAssembly