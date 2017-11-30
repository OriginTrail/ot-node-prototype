# OriginTrail Proto node

## About OriginTrail

OriginTrail enables seamless data sharing along any supply chain. Decentralized, blockchain-supported platform ensures trust, transparency and security. It helps companies exchange relevant data seamlessly and in a secure way to build accountability, protect their brands and save money.

More information on OriginTrail can be found:
- on the [website](https://origintrail.io/token-sale/)
- in the [Whitepaper](https://origintrail.io/wp-content/uploads/2017/10/OriginTrail-White-Paper.pdf)
- in the [Overview document](https://origintrail.io/wp-content/uploads/2017/10/OriginTrail-Overview.pdf)
- in our [Medium blog](https://medium.com/origintrail)
- our [Telegram channel](https://t.me/origintrail) 

## Prototype

This repository contains the development prototype of OriginTrail protocol node software consisting of the minimal building blocks of the system:

- a **GS1 based importer**, ported from the previous (centralized) version of OriginTrail
- a **Blockchain interface** which provides an API towards different blockchains
- an **IPC API** for internal calls and interaction with the node
- an **RPC API** for remote calls on between the nodes of the network
- an basic implementation of the graph database interface (currently for ArangoDB, further implementations will follow)


## Installation

1. Install [ArangoDB](https://www.arangodb.com/download-major/) and Python3
2. Run `npm install`
3. Configure config.json with proper parameters

## Related repositories

Related repositories will be posted in this section in the near future, which will include: 

- ERP Connector interfaces to OriginTrail
- Token sale smart contracts
- Application instances built on OriginTrail by our team
- Links to relevant repositories by third-party developers

## Contact us

We are looking for collaborators and new team members - feel free to [email us](mailto:office@origin-trail.com) and we will get back to you as soon as possible.
