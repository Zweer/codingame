# The alien business of cows

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/the-alien-business-of-cows)

**Level:** medium
**Topics:** Reading the statement, Distances, String manipulation, Logic

## Goal 

Within the Universe, **Earth cows are highly prized**. Some would accuse aliens of stealing them to supply the best restaurants in the galaxy with meat. Others argue that cows are used as Earth ambassadors within the galaxy, because aliens have experimented with all the beings of Earth, and have learned that cows are the most intelligent and wise.  
  
On **23rd of March 1983**, President **Ronald Reagan** of the USA announced the **Strategic Defense Initiative (SDI)**, nicknamed by the medias as the **Star Wars program**. Although most people thought that it was a missile defense system to protect the USA from USSR attacks by ballistic nuclear weapons, the Department of Defense organized it as the **military answer to alien operations on North America**. Since the beginning of 1984, the **Homing Overlay Experiment (HOE)** provides **hit-to-kill missiles** going up to 6 km/s to search and destroy any object until an altitude of 160 km. Those **Minuteman missiles** are launched from the **Space Launch Complexe 1** of the **Vandenberg Space Force Base**, Santa Barbara County, California (34°45'21.8"N, 120°37'34.8"W, elevation: 46 meters).  
  
**You are an alien mercenary** working for the **Corporation of Abduction and Transfer of Typical Livestock from Earth (C.A.T.T.L.E.)**, the biggest industry of its kind in the Milky Way. This corporation has a hidden base on one of Jupiter's moons, from where **different types of collectors** are sent to Earth. Your corporation takes a very dim view of the new earth defense system, which has already caused the company's stock to fall in value on the Universe stock exchange. **The CEO, Elon Mowsk, has tasked you with defining the feasibility of upcoming missions**.  
  
C.A.T.T.L.E. **collectors take off vertically** at a speed of collector speed to escape Earth's gravity, and this speed is kept until the moon orbit altitude (385 000 km). A collector aims at its target point, **stops at 500 meters above the ground**, out of effective range of assault rifles. It then **abducts as many cows as possible** until collector maximum capacity, and takes off. To not kill the cow during the abduction, they are **captured one by one at a speed of 9.81 m/s** . This collecting speed is multiplied by the collector levitation efficiency parameter.  
However, **once the abducting device is on**, a special SDI radar detects it and a **MinuteMan missile is immediately launched at maximum speed** from the **Space Launch Complexe 1** of the **Vandenberg Space Force Base**. It **goes in a straight line from the silo to its limit altitude above the anomaly** pointed by the HOE radar, **then fall vertically**. If it collides with a C.A.T.T.L.E. collector, both explode, Elon Mowsk is furious, the collector crew is dead, and you are held responsible for the deaths.  
  
As you don't want to go to intergalactic jail, you must tell if a **mission** is **possible or not**, given the name of the destination, its latitude, longitude, and elevation. A mission is possible if one collector abduct cows and flee without getting hit by a MinuteMan missile. if the mission is possible, you have to give the **collector type** to send and the **number of cows** it will bring back. Beware, sending a collector has a cost that must be covered by the number of cows brought back.  
  
Collectors type  
The VaCoWM Cleaner is the formula 1 of the collectors. Designed to be fast, it can get to 44.7 km/s in Earth atmosphere. However, the lack of space limits the capacity to 3 cows only, and its smaller abduction beams has a levitation efficiency of 0.8. It is the cheapest collector, and make profitable missions if it brings back at least one cow.  
The L4nd MoWer is the medium collector. It was designed to have a good balance between speed (22.38 km/s and capacity (10 cows), with a good quality abduction device (efficiency of 1.2). 4th generation of its kind, it must bring back at least 6 cows to be profitable.  
The Cow Harvester is the biggest of its kind, just fast enough to escape Earth's gravity (11.19 km/s). Its "slowness" is compensated by its capacity (20 cows!) and its premium abduction device which can levitate cows with an impressive 1.5 efficiency. King of collectors, it is not cheap to send it, and must bring at least 14 cows for a mission to be worth it.  
  
**Example**  
If a L4nd Mower can get 8 cows and a VaCoWM 3 cows, send the first one (more cows!). But if a L4nd Mower can get 5 cows and a VaCoWM 3 cows, send the last one, because sending the first one is not profitable. 

Input

**First line :** N number of upcoming missions.  
**N next lines :** a string upcomingMission with the name of the location, coordinates latitude and longitude in degrees/minutes/seconds, elevation in meters.

Output

**N lines :** For each mission, the output form should be one of these :  
name of the location: impossible.  
name of the location: possible. Send a collector type to bring back number of abducted cows cow/ cows. (English rules, so cow has an s if there is more than one cow).

Constraints

The cow-llect area is North america. Hence :   
\- latitude is always in N  
\- longitude is always in W  
PI \= 3.14159265359  
  
**Help**  
Coordinates in degrees/minutes/seconds should be converted to decimal using the simplest conversion: **Decimal Degrees = degrees \+ (minutes/60) + (seconds/3600)**.  
\- One degree in latitude is equal to **111.11 km**.  
\- One degree in longitude between two points is equal to **111.11\*cos( (latitude1+latitude2) /2)**.  
**Be careful** of the actual unit expected by the platform cos function !

Example

Input

11
Boadwine Farms Inc (South Dakota, USA) 43°44'41.7"N 96°49'37.4"W 496
George Farms (Wyoming, USA) 44°38'39.1"N 108°58'19.0"W 1467
Coronado Dairy (Arizona, USA) 32°01'35.6"N 109°45'44.3"W 1289
Peaceful Hills Farm (Missouri, USA) 39°04'39.6"N 94°11'49.5"W 282
Grotegut Dairy Farm Inc (Wisconsin, USA) 43°59'33.9"N 87°45'19.2"W 227
Crooked Creek Farm Dairy (Michigan, USA) 42°51'18.8"N 82°59'26.4"W 237
MVP Dairy, LLC (Ohio, USA) 40°37'28.0"N 84°31'41.0"W 253
The Family Cow (Pennsylvania, USA) 39°58'02.7"N 77°34'26.9"W 213
Kleinpeter Farms Dairy LLC (Louisiana, USA) 30°21'47.1"N 91°01'21.1"W 8
Working Cows Dairy (Alabama, USA) 31°11'14.2"N 85°36'06.3"W 83
Happy Cow Creamery (South Carolina, USA) 34°36'51.1"N 82°21'13.1"W 249

Output

Boadwine Farms Inc (South Dakota, USA): possible. Send a L4nd MoWer to bring back 8 cows.
George Farms (Wyoming, USA): possible. Send a VaCoWM Cleaner to bring back 3 cows.
Coronado Dairy (Arizona, USA): possible. Send a VaCoWM Cleaner to bring back 2 cows.
Peaceful Hills Farm (Missouri, USA): possible. Send a L4nd MoWer to bring back 9 cows.
Grotegut Dairy Farm Inc (Wisconsin, USA): possible. Send a Cow Harvester to bring back 14 cows.
Crooked Creek Farm Dairy (Michigan, USA): possible. Send a Cow Harvester to bring back 16 cows.
MVP Dairy, LLC (Ohio, USA): possible. Send a Cow Harvester to bring back 15 cows.
The Family Cow (Pennsylvania, USA): possible. Send a Cow Harvester to bring back 18 cows.
Kleinpeter Farms Dairy LLC (Louisiana, USA): possible. Send a L4nd MoWer to bring back 10 cows.
Working Cows Dairy (Alabama, USA): possible. Send a Cow Harvester to bring back 15 cows.
Happy Cow Creamery (South Carolina, USA): possible. Send a Cow Harvester to bring back 16 cows.
