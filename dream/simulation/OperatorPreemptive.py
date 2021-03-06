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
Created on 27 Jan 2014

@author: Ioannis
'''

'''
Inherits from Operator. When he gets called for an operation while he is busy, 
he checks if the operation that calls him is of higher priority than the one 
that he is currently in. 
'''

from SimPy.Simulation import Resource, now
from Operator import Operator

# ===========================================================================
#                 the resource that operates the machines
# ===========================================================================
class OperatorPreemptive(Operator):
    
#     def __init__(self, id, name, capacity=1):
#         Operator.__init__(self,id=id,name=name,capacity=capacity)
#         self.type="OperatorPreemptive"

    # =======================================================================
    #                    checks if the worker is available
    # =======================================================================       
    def checkIfResourceIsAvailable(self,callerObject=None): 
        # TODO: to discuss with George about the use of callerObject
        activeResource= self.getResource()
        activeResourceQueue = activeResource.getResourceQueue()
        # find out which station is requesting the operator?
        thecaller=callerObject
        # TODO: if the callerObject is None then 
        #     perform then default behaviour. Used to find free operators 
        if thecaller==None:
            # added for testing
            len(self.Res.activeQ)<self.capacity
        # Otherwise check the operator has a reason to preempt the machine he is currently working on
        # TODO: update the objects requesting the operator
        requestingObject=thecaller.requestingObject
        # TODO: update the last object calling the operatorPool
        receivingObject=thecaller.receivingObject
        # TODO: the entity that is requesting the operator
        requestingEntity=receivingObject.requestingEntity
        
        # if the operator is not occupied return True
        if len(activeResourceQueue)==0:
            return True
        # read the station currently operated by the operator
        # TODO: the victim of the operator is the Broker of the Machine. Modify to preempt the machine and not the broker
        victim=activeResourceQueue[0].victim
        # read its activeQ
        victimQueue=victim.getActiveObjectQueue()

        requestingObjectQueue=requestingObject.getActiveObjectQueue()
        receivingObjectQueue=receivingObject.getActiveObjectQueue()
        #if the receiver is not empty and the caller is not empty
        if len(victimQueue) and len(requestingObjectQueue):
            try:
                #if the  Entity to be forwarded to the station currently processed by the operator is critical
                if requestingObjectQueue[0].isCritical:
                    #if the receiver does not hold an Entity that is also critical
                    if not victimQueue[0].isCritical and not receivingObjectQueue[0].isCritical:
                        # then the receiver must be preemptied before it can receive any entities from the calerObject
                        victim.shouldPreempt=True
                        victim.preempt()
                        victim.timeLastEntityEnded=now()     #required to count blockage correctly in the preemptied station
                        return True
            # if the entity has no isCritical property then ran the default behaviour
            except:
                pass
        return len(self.Res.activeQ)<self.capacity
