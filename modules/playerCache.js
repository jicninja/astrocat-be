const players = new Map();

const addPlayer = (id, data) => players.set(id, data);
const addArrayPlayer = (playerArray) => {
    playerArray.map(({id , ...rest}) => {
        players.set(id, rest);
    });
};

const editPlayer = (id, data) => {
    if(players.get(id)) {
        players.set(id, data);
    }    
};

const getPlayersCount = () => players.size;

const getPlayers = (isArray) => {
    if(isArray) {
        const array = [];
        players.forEach((value, key) => {
            array.push({id: key, value});            
        });
        return array;
    }
    return players;
};

const getOtherPlayers = (currentId) => {
    return getPlayers(true).filter(({id})=> id != currentId);
}

const deletePlayer = (id) => players.delete(id);

const getPlayer = (id) => players.get(id);

module.exports = { getPlayers, addPlayer, deletePlayer, editPlayer, getPlayersCount, getPlayer, getOtherPlayers, addArrayPlayer };