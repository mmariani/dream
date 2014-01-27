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
        activeResource= self.getResource()
        activeResourceQueue = activeResource.getResourceQueue()
        try:
            # read the station operated by the operator
            victim=activeResourceQueue[0]
            # read its activeQ
            victimQueue=victim.getActiveObjectQueue()
            # find out which station is requesting the operator?
            thecaller=callerObject
            thecallerQueue=thecaller.getActiveObjectQueue()
            
            #if the receiver is not empty
            if len(victimQueue)>0:
                # and the caller is not empty
                if len(thecallerQueue)>0:
                    #if the  Entity to be forwarded to the station currently processed by the operator is critical
                    if thecallerQueue[0].isCritical:
                        #if the receiver does not hold an Entity that is also critical
                        if not victimQueue[0].isCritical:
                            # then the receiver must be preemptied before it can receive any entities from the calerObject
                            victim.shouldPreempt=True
                            victim.preempt()
                            victim.timeLastEntityEnded=now()     #required to count blockage correctly in the preemptied station
                            return True
        # if the operator is not occupied, or if the caller is None then perform the default behaviour
        except:
            pass
        return len(self.Res.activeQ)<self.capacity
