const fs = require("fs");

class database {

    constructor () {

        //check if the config part of the db is there
        let a = fs.readdirSync("./db")

        if(!a.some(b => b == "config")){

            //if not, make the folder for it
            fs.mkdirSync("./db/config")

        }

        //fetch the stored config files
        let configfilelist = fs.readdirSync("./db/config")

        //set up cache for db so dont have to wait on disk every time
        this.cache = new Map()

        // go ahead and load configs so dont have to wait for disk.
        // size should be small enough to cache it all without
        // worrying about ram usage
        configfilelist.forEach(fileName => {

            //filename is derived from the room id (map key)
            let id = fileName.substring(0, fileName.length - 5)

            //map to shove data into
            let configMap = new Map()

            //read the config and parse it to add it to cache
            let rawconfig = JSON.parse(fs.readFileSync("./db/config/" + fileName))

            //pull the individual configs into a uniform map format
            Object.entries(rawconfig).forEach(([key, value]) => {configMap.set(key, value)})


            this.cache.set(id, configMap)

        })

    }

    getConfig (roomId, config) {

        //make sure there is a config for this room
        let cache = this.cache.get(roomId)

        //if we have a config file for the room, return the requested config
        if (cache) return cache.get(config)

        //if not return null (defaults to falsey value for config)
        return null

    }

    setConfig (roomId, config, value, callback) {

        //fetch the existing config
        let cachedconfig = this.cache.get(roomId)

        //if no config exists, make one
        if (!cachedconfig) cachedconfig = new Map()

        //write setting to the config
        cachedconfig.set(config, value)

        //write the config to the global cache
        this.cache.set(roomId, cachedconfig)

        //write current config to disk
        fs.writeFile(("./db/config/" + roomId + ".json"), JSON.stringify(Object.fromEntries(cachedconfig), null, 2), err =>{

            if(err) callback("🍃 | I ran into the following error trying to write this config to disk. Please report this to @jjj333_p_1325:matrix.org in #anti-scam-support:matrix.org\n\n" + err)

            else callback("✅ | Successfully saved.")
            
        })

    }

    cloneRoom (fromId, toId, callback){

        //fetch the existing config
        let from = this.cache.get(fromId)

        //make sure we have something to copy
        if (!from) {
            
            callback("🍃 | There is no customized config to copy.")

            return

        }

        //clone the config in memory
        this.cache.set(toId, from)

        //write current config to disk
        fs.writeFile(("./db/config/" + toId + ".json"), JSON.stringify(Object.fromEntries(from), null, 2), err =>{

            if(err) callback("🍃 | I ran into the following error trying to write this config to disk. Please report this to @jjj333_p_1325:matrix.org in #anti-scam-support:matrix.org\n\n" + err)

            else callback("✅ | Successfully copied config.")
            
        })

    }

}

module.exports = {database}