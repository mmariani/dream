from dream.simulation.imports import Machine, Source, Exit, Part, Queue, G, Failure 
from dream.simulation.imports import simulate, activate, initialize, infinity

#define the objects of the model
S=Source('S','Source', interarrivalTime={'distributionType':'Fixed','mean':0.5}, entity='Dream.Part')
Q=Queue('Q','Queue', capacity=infinity)
M1=Machine('M1','Milling1', processingTime={'distributionType':'Fixed','mean':0.25})
M2=Machine('M2','Milling2', processingTime={'distributionType':'Fixed','mean':0.25})
E=Exit('E1','Exit')  

F=Failure(victim=M1, distribution={'distributionType':'Fixed','MTTF':60,'MTTR':5})

G.ObjList=[S,Q,M1,M2,E]   #add all the objects in G.ObjList so that they can be easier accessed later

G.ObjectInterruptionList=[F]     #add all the objects in G.ObjList so that they can be easier accessed later


#define predecessors and successors for the objects    
S.defineRouting([Q])
Q.defineRouting([S],[M1,M2])
M1.defineRouting([Q],[E])
M2.defineRouting([Q],[E])
E.defineRouting([M1,M2])

def main():
    initialize()                        #initialize the simulation (SimPy method)
        
    for object in G.ObjList:
        object.initialize()
        
    for objectInterruption in G.ObjectInterruptionList:
        objectInterruption.initialize()
    
    #activate all the objects 
    for object in G.ObjList:
        activate(object, object.run())
    
    for objectInterruption in G.ObjectInterruptionList:
        activate(objectInterruption, objectInterruption.run())
    
    G.maxSimTime=1440.0     #set G.maxSimTime 1440.0 minutes (1 day)
        
    simulate(until=G.maxSimTime)    #run the simulation
    
    #carry on the post processing operations for every object in the topology       
    for object in G.ObjList:
        object.postProcessing()
    
    #print the results
    print "the system produced", E.numOfExits, "parts"
    working_ratio_M1=(M1.totalWorkingTime/G.maxSimTime)*100
    working_ratio_M2=(M2.totalWorkingTime/G.maxSimTime)*100
    print "the working ratio of", M1.objName,  "is", working_ratio_M1, "%"
    print "the working ratio of", M2.objName,  "is", working_ratio_M2, "%"
    return {"parts": E.numOfExits,
          "working_ratio_M1": working_ratio_M1,
          "working_ratio_M2": working_ratio_M2}

if __name__ == '__main__':
    main()

