const express = require('express');
const router = express.Router();
const redis = require('redis');
const client = redis.createClient();
const axios = require('axios');
client.connect().then(() => { });

function getIdFromUrl(url) {
    const parts = url.split('/');
    return parts[parts.length - 2];
}

const pokemonMiddleware = async (req, res, next) => {
    let exists = await client.exists('pokemonList');
    if (exists) {
        console.log('Show Pokémon from cache');
        let pokemonList = await client.get('pokemonList');
        pokemonList = JSON.parse(pokemonList);
        return res.status(200).json(pokemonList)
        // pokemonList = pokemonList.map(pokemon => ({
        //     ...pokemon,
        //     id: getIdFromUrl(pokemon.url)
        // }));
        // res.render('pokemon/pokemonlist', { pokemon: pokemonList, type: 'pokemon' }, (err, html) => {
        //     if (err) {
        //         return res.status(500).send('Internal Server Error');
        //     }
        //     res.status(200).send(html);
        // });
    }
    next();
};


const moveMiddleware = async (req, res, next) => {
    let exists = await client.exists('moveList');
    if (exists) {
        console.log('Show moves from cache');
        let moveList = await client.get('moveList');
        moveList = JSON.parse(moveList);
        return res.status(200).json(moveList)
        // moveList = moveList.map(move => ({
        //     ...move,
        //     id: getIdFromUrl(move.url)
        // }));
        // res.render('pokemon/pokemonlist', { pokemon: moveList, type: 'move' }, (err, html) => {
        //     if (err) {
        //         return res.status(500).send('Internal Server Error');
        //     }
        //     res.status(200).send(html);
        // });
    }
    next();
};

const itemMiddleware = async (req, res, next) => {
    let exists = await client.exists('itemList');
    if (exists) {
        console.log('Show items from cache');
        let itemList = await client.get('itemList');
        itemList = JSON.parse(itemList);
        return res.status(200).json(itemList)
        // itemList = itemList.map(item => ({
        //     ...item,
        //     id: getIdFromUrl(item.url)
        // }));
        // res.render('pokemon/pokemonlist', { pokemon: itemList, type: 'item' }, (err, html) => {
        //     if (err) {
        //         return res.status(500).send('Internal Server Error');
        //     }
        //     res.status(200).send(html);
        // });
    }
    next();
};

const pokemonId = async (req, res, next) => {
    if (req.originalUrl !== '/api/pokemon/history') {
        const pokemonId = `${req.params.id}`;
        let exists = await client.exists(pokemonId);
        if (exists) {
            console.log('Show Pokemon in Cache');
            let data = await client.get(pokemonId);
            data = JSON.parse(data)
            await client.lPush('recentlyViewed', JSON.stringify(data));
            await client.lTrim('recentlyViewed', 0, 24);
            console.log('Sending data from Redis....');
            return res.status(200).json(data)
            // res.render('pokemon/pokemon', { pokemon: data }, async (err, html) => {
            //     if (err) {
            //         return res.status(500).send('Internal Server Error');
            //     }
            //     res.status(200).send(html);
            // });
        } else {
            next();
        }
    } else {
        next();
    }
};

const moveId = async (req, res, next) => {
    let exists = await client.exists(`m${req.params.id}`);
    if (exists) {
        console.log('Show Move in Cache');
        let data = await client.get(`m${req.params.id}`);
        data = JSON.parse(data)
        console.log('Sending data from Redis....');
        return res.status(200).json(data)
        // res.render('pokemon/move', { move: data }, async (err, html) => {
        //     if (err) {
        //         return res.status(500).send('Internal Server Error');
        //     }
        //     res.status(200).send(html);
        // });
    } else {
        next();
    }
};

const itemId = async (req, res, next) => {
    let exists = await client.exists(`i${req.params.id}`);
    if (exists) {
        console.log('Show Item in Cache');
        let data = await client.get(`i${req.params.id}`);
        data = JSON.parse(data)
        console.log('Sending data from Redis....');
        return res.status(200).json(data)
        // res.render('pokemon/item', { item: data }, async (err, html) => {
        //     if (err) {
        //         return res.status(500).send('Internal Server Error');
        //     }
        //     res.status(200).send(html);
        // });
    } else {
        next();
    }
};

router.get('/pokemon/', pokemonMiddleware, async (req, res) => {
    try {
        console.log('Pokemon List not cached')
        let pokemonData = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=999999')
        let pokemonList = pokemonData.data.results
        await client.set('pokemonList', JSON.stringify(pokemonList));
        // pokemonList = pokemonList.map(pokemon => ({
        //     ...pokemon,
        //     id: getIdFromUrl(pokemon.url)
        // }));
        return res.status(200).json(pokemonList)
        // res.render('pokemon/pokemonlist', { pokemon: pokemonList, type: 'pokemon' }, async (err, html) => {
        //     if (err) {
        //         return res.status(500).send('Internal Server Error');
        //     }
        //     console.log('HTML Stored in Cache', html);
        //     res.status(200).send(html);
        // });
    } catch (error) {
        const statusCode = error.response.status;
        if (statusCode === 404) {
            return res.status(statusCode).json({ message: 'Invalid Pokemon Route' });
        }
        else if (statusCode === 500) {
            return res.status(statusCode).json({ message: 'Error fetching Pokemon data' });
        }
        else {
            return res.status(statusCode).json({ message: 'Other Error' });
        }
    }
});

router.get('/pokemon/history', async (req, res) => {
    try {
        let recentlyViewed = await client.lRange('recentlyViewed', 0, 24);
        recentlyViewed = recentlyViewed.map( pokemon => {
            return JSON.parse(pokemon)
        }
        )
        // const pokemonData = [];
        // await Promise.all(recentlyViewed.map(async (id) => {
        //     let cachedPokemon = await client.get(`${id}`);
        //     cachedPokemon = JSON.parse(cachedPokemon)
        //     if (cachedPokemon) {
        //         // pokemonObj = {
        //         //     name: cachedPokemon.name,
        //         //     id: id
        //         // }
        //         pokemonData.push(cachedPokemon);
        //     }
        // }));
        return res.status(200).json(recentlyViewed)
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/pokemon/:id', pokemonId, async (req, res) => {
    try {
        try {
            const id = parseInt(req.params.id)
            if (id <= 0){
                throw 'invalid pokemon ID';
            } 
        } catch (e) {
            return res.status(400).json({ error: e });
        }
        console.log('Pokemon not in cache');
        let { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${req.params.id}`);
        await client.set(`${req.params.id}`, JSON.stringify(data));
        await client.lPush('recentlyViewed', JSON.stringify(data));
        await client.lTrim('recentlyViewed', 0, 24);
        return res.status(200).json(data)
        // res.render('pokemon/pokemon', { pokemon: data }, async (err, html) => {
        //     if (err) {
        //         return res.status(500).send('Internal Server Error');
        //     }
        //     console.log(1)
        //     await client.lPush('recentlyViewed', `${req.params.id}`);
        //     await client.lTrim('recentlyViewed', 0, 24);
        //     return res.status(200).send(html);
        // });
    } catch (error) {
        const statusCode = error.response.status;
        if (statusCode === 404) {
            return res.status(statusCode).json({ message: 'Invalid Pokemon Id' });
        }
        else if (statusCode === 500) {
            return res.status(statusCode).json({ message: 'Error fetching Pokemon data' });
        }
        else {
            return res.status(statusCode).json({ message: 'Other Error' });
        }
    }
});

router.get('/move/', moveMiddleware, async (req, res) => {
    try {
        console.log('Move List not cached')
        let moveData = await axios.get('https://pokeapi.co/api/v2/move?limit=999999')
        let moveList = moveData.data.results
        await client.set('moveList', JSON.stringify(moveList));
        // moveList = moveList.map(move => ({
        //     ...move,
        //     id: getIdFromUrl(move.url)
        // }));
        // res.render('pokemon/pokemonlist', { pokemon: moveList, type: 'move' }, async (err, html) => {
        //     if (err) {
        //         return res.status(500).send('Internal Server Error');
        //     }
        //     res.status(200).send(html);
        // });
        return res.status(200).json(moveList)
    } catch (error) {
        const statusCode = error.response.status;
        if (statusCode === 404) {
            return res.status(statusCode).json({ message: 'Invalid Move Route' });
        }
        else if (statusCode === 500) {
            return res.status(statusCode).json({ message: 'Error fetching Pokemon data' });
        }
        else {
            return res.status(statusCode).json({ message: 'Other Error' });
        }
    }
});
router.get('/move/:id', moveId, async (req, res) => {
    try {
        try {
            const id = parseInt(req.params.id)
            if (id <= 0){
                throw 'invalid move ID';
            } 
        } catch (e) {
            return res.status(400).json({ error: e });
        }
        console.log('Move not in cache');
        let { data } = await axios.get(`https://pokeapi.co/api/v2/move/${req.params.id}`);
        await client.set(`m${req.params.id}`, JSON.stringify(data));
        return res.status(200).json(data)
        // res.render('pokemon/move', { move: data }, async (err, html) => {
        //     if (err) {
        //         return res.status(500).send('Internal Server Error');
        //     }
        //     return res.status(200).send(html);
        // });
    } catch (error) {
        const statusCode = error.response.status;
        if (statusCode === 404) {
            return res.status(statusCode).json({ message: 'Invalid Move Id' });
        }
        else if (statusCode === 500) {
            return res.status(statusCode).json({ message: 'Error fetching Move data' });
        }
        else {
            return res.status(statusCode).json({ message: 'Other Error' });
        }
    }
});
router.get('/item/', itemMiddleware, async (req, res) => {
    try {
        console.log('Item List not cached')
        let itemData = await axios.get('https://pokeapi.co/api/v2/item?limit=999999')
        let itemList = itemData.data.results
        await client.set('itemList', JSON.stringify(itemList));
        return res.status(200).json(itemList)
        // itemList = itemList.map(item => ({
        //     ...item,
        //     id: getIdFromUrl(item.url)
        // }));
        // res.render('pokemon/pokemonlist', { pokemon: itemList, type: 'item' }, async (err, html) => {
        //     if (err) {
        //         return res.status(500).send('Internal Server Error');
        //     }
        //     res.status(200).send(html);
        // });
    } catch (error) {
        const statusCode = error.response.status;
        if (statusCode === 404) {
            return res.status(statusCode).json({ message: 'Invalid Item Route' });
        }
        else if (statusCode === 500) {
            return res.status(statusCode).json({ message: 'Error fetching Item data' });
        }
        else {
            return res.status(statusCode).json({ message: 'Other Error' });
        }
    }
});
router.get('/item/:id', itemId, async (req, res) => {
    try {
        try {
            const id = parseInt(req.params.id)
            if (id <= 0){
                throw 'invalid item ID';
            } 
        } catch (e) {
            return res.status(400).json({ error: e });
        }
        console.log('Item not in cache');
        let { data } = await axios.get(`https://pokeapi.co/api/v2/item/${req.params.id}`);
        await client.set(`i${req.params.id}`, JSON.stringify(data));
        return res.status(200).json(data)
        // res.render('pokemon/item', { item: data }, async (err, html) => {
        //     if (err) {
        //         return res.status(500).send('Internal Server Error');
        //     }
        //     res.status(200).send(html);
        // });
    } catch (error) {
        const statusCode = error.response.status;
        if (statusCode === 404) {
            return res.status(statusCode).json({ message: 'Invalid Item Id' });
        }
        else if (statusCode === 500) {
            return res.status(statusCode).json({ message: 'Error fetching Item data' });
        }
        else {
            return res.status(statusCode).json({ message: 'Other Error' });
        }
    }
});

module.exports = router;