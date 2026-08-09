import City from "../Data/City.js";

const cityStateName = async (address, StateName) => {
    const state = StateName.find(data => data.id == address.state);
    const city = City.find(data => data.id == address.city);

    return {
        ...address.toObject(),
        stateName: state ? state.name : "",
        cityName: city ? city.name : ""
    };
};

export default cityStateName;