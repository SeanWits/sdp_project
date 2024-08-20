# System Architecture
The system architecture for this system will be Micro-Services, specifically API-micro-services and three-tier architecture.
## Why?
Each of our systems will be communicating through well-defined APIs, ensuring modularity and scalability. The micro-services architecture allows for the system to be broken down into smaller, manageable services, each responsible for a specific piece of functionality. This enables easier development, deployment, and maintenance, as each micro-service can be updated or scaled independently.

The three-tier architecture, which typically includes the presentation layer (user interface), application layer (business logic), and data layer (database management), is well-suited for this structure.  
Benefits:
* Scalability: Each micro-service can be scaled independently based on demand, leading to more efficient resource utilisation. 
* Flexibility: The architecture supports the use of different technologies and frameworks for different micro-services, allowing the system to leverage the best tools for each task. 
* Resilience: In case of a failure in one micro-service, the rest of the system can continue functioning, improving overall system resilience. 
* Agility: Developers can work on different services simultaneously, accelerating development cycles and facilitating continuous deployment. 
By combining micro-services with a three-tier architecture, we ensure that our system is not only robust and scalable but also flexible enough to adapt to future requirements and technological advancements.
