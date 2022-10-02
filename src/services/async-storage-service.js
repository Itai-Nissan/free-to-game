import axios from 'axios';

export const storageService = {
  query,
  get,
  post,
  put,
  remove,
  gameById,
}

const PAGE_SIZE = 24

function filter(games, filterBy) {
  let filteredGames = games

  // BY TEXT
  if (filterBy.name) {
    filteredGames = filteredGames.filter(
      (game) =>
        game.title.toLowerCase().includes(filterBy.name)
        ||
        game.genre.toLowerCase().includes(filterBy.name)
    )
  }

  //BY SORT
  if (filterBy.sortBy) {

    if (filterBy.sortBy === 'release')
      filteredGames = filteredGames.sort((a, b) => {
        //   if (a.release_date < b.release_date) {
        //     return -1;
        //   }
        // })
        if (a.release_date < b.release_date) {
          return 1;
        }
        else return -1
      })

    if (filterBy.sortBy === 'nameDsc')
      filteredGames = filteredGames.sort((a, b) => {
        if (a.title < b.title) {
          return 1;
        }
        else return -1
      })

    if (filterBy.sortBy === 'nameAsc')
      filteredGames = filteredGames.sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        }
      })
  }

  //BY LABLE
  if (filterBy.lable) {
    if (filterBy.lable === 'All') return filteredGames
    else {
      filteredGames = filteredGames.filter(
        (game) =>
          game.genre.includes(filterBy.lable)
      )
    }
  }

  return filteredGames
}

async function query(entityType, filterBy, pageIdx) {
  console.log('loading');
  let games = JSON.parse(localStorage.getItem(entityType)) || []

  if (!games.length || !games) {
    games = await getGames(entityType)
  }

  // FILTER
  if (!filterBy) filterBy = {}
  if (filterBy === {}) {
    return games
  }
  else {
    games = filter(games, filterBy)
  }

  // PAGING
  let currPage = pageIdx
  let gamesLength = games.length

  if (!currPage && currPage !== 0) return Promise.resolve(games)
  else {
    const startIdx = currPage * PAGE_SIZE
    games = games.slice(startIdx, startIdx + PAGE_SIZE)
  }

  let gamesInfo = {
    games,
    gamesLength
  }
  return Promise.resolve(gamesInfo)
}

async function getGames(entityType) {
  console.log('fetching');
  let games = []
  
  const entities = {
    method: 'GET',
    url: 'https://free-to-play-games-database.p.rapidapi.com/api/games',
    // params: { category: 'shooter' },
    headers: {
      'X-RapidAPI-Key': 'a38ff25a46msh308ca696239e976p1f5e31jsnd96340e8e05f',
      'X-RapidAPI-Host': 'free-to-play-games-database.p.rapidapi.com'
    }
  };

  await axios.request(entities)
    .then(function (response) {
      // console.log(response.data);
      games = response.data
      _save(entityType, games)
    }).catch(function (error) {
      console.error(error);
    });

  return games
}

function get(entityType, entityId) {
  entityId = entityId
  return gameById(entityType, entityId)
  // return gameById(entityType, entityId).then((entities) =>
  //   entities.find((entity) => entity.id === entityId)
  // )
}

async function gameById(entityType, entityId){
  let game = []
  const entities = {
    method: 'GET',
    url: 'https://free-to-play-games-database.p.rapidapi.com/api/game',
    params: { id: entityId },
    headers: {
      'X-RapidAPI-Key': 'a38ff25a46msh308ca696239e976p1f5e31jsnd96340e8e05f',
      'X-RapidAPI-Host': 'free-to-play-games-database.p.rapidapi.com'
    }
  };

  await axios.request(entities)
    .then(function (response) {
      console.log(response.data);
      game = response.data
    }).catch(function (error) {
      console.error(error);
    })
    return game
}


function post(entityType, newEntity) {
  newEntity._id = _makeId()
  return query(entityType).then((entities) => {
    entities.push(newEntity)
    _save(entityType, entities)
    return newEntity
  })
}

function put(entityType, updatedEntity) {
  return query(entityType).then((entities) => {
    const idx = entities.findIndex((entity) => entity._id === updatedEntity._id)
    entities.splice(idx, 1, updatedEntity)
    _save(entityType, entities)
    return updatedEntity
  })
}

function remove(entityType, entityId) {
  return query(entityType).then((entities) => {
    const idx = entities.findIndex((entity) => entity._id === entityId)
    if (idx < 0) throw new Error(`Unknown Entity ${entityId}`)
    entities.splice(idx, 1)
    _save(entityType, entities)
  })
}

function _save(entityType, entities) {
  localStorage.setItem(entityType, JSON.stringify(entities))
}

function _makeId(length = 5) {
  var text = ''
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}