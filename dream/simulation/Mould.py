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
Created on 17 Jan 2014

@author: Ioannis
'''
'''
Mould is an Entity that assembled out of OrderComponents and has a parent Order 
'''

from Globals import G
from Job import Job

# ===========================================================================
# The Mould object
# ===========================================================================
class Mould(Job):                                  # inherits from the Job class   
    type="Mould"
    
    def __init__(self, id=None, 
                 name=None, 
                 route=[], 
                 priority=0, 
                 dueDate=None, 
                 orderDate=None, 
                 extraPropertyDict=None,
                 order=None, 
                 isCritical=False):
        Job.__init__(self, id, name, route, priority, dueDate, orderDate, extraPropertyDict, isCritical)
        self.order=order            # parent order of the order component
        # TODO: in case the order is not given as argument (when the component is given as WIP) have to give a manager as argument
        #     or create the initiate the parent order not as WIP 
        if self.order:
            # if the order is not None, and the order.manager is given
            if self.order.manager:
                self.manager=self.order.manager
        # variable to be used by OperatorRouter
        self.hot=False
        # TODO: isCritical argument is deprecated
#         self.isCritical=isCritical  # this should be self.order.isCritical. Added now for testing