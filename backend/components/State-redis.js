import redis from "../config/redis.js"
import States from "../Data/Stata.js"

const State = async (req, res,next) => {
    try {
        const cachedStates = await redis.get('states');
         if (cachedStates) {
            // console.log("cachedStates",cachedStates)
            req.states = JSON.parse(cachedStates);
            return next();
        }
        const data = States; // or await State.find()
        await redis.set('states', JSON.stringify(States), { EX: 3600 }); // 1h

        req.states = data;
        //  console.log("req.states ",  req.states )
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
export default State
