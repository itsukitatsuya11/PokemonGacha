const apiUrl = 'https://pokeapi.co/api/v2/pokemon/';
let cardCollection = JSON.parse(localStorage.getItem('cardCollection')) || [];

window.onload = () => {
    updateCardCollection();
};

function gacha() {
    const gachaButton = document.getElementById('gachaButton');
    gachaButton.disabled = true;

    let seconds = 10; // Waktu countdown
    gachaButton.textContent = `Wait ${seconds} seconds`;

    const countdownInterval = setInterval(() => {
        seconds--;
        gachaButton.textContent = `Wait ${seconds} seconds`;
        if (seconds === 0) {
            clearInterval(countdownInterval);
            gachaButton.disabled = false; 
            gachaButton.textContent = 'Gacha';
        }
    }, 1000); // Interval 1 detik

    fetch(apiUrl + getRandomPokemonId())
        .then(response => response.json())
        .then(data => {
            if (data && data.stats) { // Memeriksa apakah data dan properti 'stats' ada
                const pokemonContainer = document.getElementById('pokemonContainer');
                while (pokemonContainer.firstChild) {
                    pokemonContainer.removeChild(pokemonContainer.firstChild);
                }
                displayPokemon(data);
                cardCollection.push(data);
                saveCardCollection(); 
                updateCardCollection();
            } else {
                console.error('Invalid data format:', data);
            }
        })
        .catch(error => console.error('Error:', error));
}

function getRandomPokemonId() {
    return Math.floor(Math.random() * 898) + 1;
}

function saveCardCollection() {
    localStorage.setItem('cardCollection', JSON.stringify(cardCollection));
}

function deletePokemon(index) {
    cardCollection.splice(index, 1); 
    saveCardCollection(); 
    updateCardCollection(); 
}

function searchPokemon() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filteredCardCollection = cardCollection.filter(pokemon => {
        return pokemon.id.toString().includes(searchInput); 
    });
    updateCardCollection(filteredCardCollection);
}

function updateCardCollection(filteredCardCollection) {
    const cardCollectionDiv = document.getElementById('cardCollection');
    cardCollectionDiv.innerHTML = '';
    (filteredCardCollection || cardCollection).forEach((pokemon, index) => {
        let totalStats = 0;
        ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].forEach(statName => {
            const stat = pokemon.stats.find(stat => stat.stat.name === statName);
            totalStats += stat.base_stat;
        });

        const pokemonDiv = document.createElement('div');
        pokemonDiv.classList.add('pokemon');
        pokemonDiv.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <div class="card">
                <span>Name:</span>
                <span class="infodata">${pokemon.name}</span>
            </div>
            <div class="card">
                <span>ID:</span>
                <span class="infodata">#${pokemon.id}</span>
            </div>
            <div class="card">
                <span>Type:</span>
                <span class="infodata">${pokemon.types.map(type => type.type.name).join(', ')}</span>
            </div>
            <div class="card">
                <span>Strength:</span>
                <span class="infodata">${totalStats}</span>
            </div>
            <button class="accordion">Details</button>
            <div class="panel" style="display: none;">
                <hr/>
                <div class="card">
                    <span>&bull; Height:</span>
                    <span class="infodata">${pokemon.height}</span>
                </div>
                <div class="card">
                    <span>&bull; Weight:</span>
                    <span class="infodata">${pokemon.weight}</span>
                </div>
                <div class="card">
                    <span>&bull; Weakness:</span>
                    <span class="infodata">${getWeakness(pokemon.types)}</span>
                </div>
                <div class="card">
                    <span>&bull; Category:</span>
                    <span class="infodata">${pokemon.species.name}</span>
                </div>
                <div class="card">
                    <span>&bull; Abilities:</span>
                    <span class="infodata">${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</span>
                </div>
                <hr/>
                <div class="card">
                    <span>&bull; Stats:</span>
                    <table class="stats-table">
                        <tr>
                            <td>HP</td>
                            <td class="infodata">${pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}</td>
                        </tr>
                        <tr>
                            <td>Attack</td>
                            <td class="infodata">${pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}</td>
                        </tr>
                        <tr>
                            <td>Defense</td>
                            <td class="infodata">${pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat}</td>
                        </tr>
                        <tr>
                            <td>Special Attack</td>
                            <td class="infodata">${pokemon.stats.find(stat => stat.stat.name === 'special-attack').base_stat}</td>
                        </tr>
                        <tr>
                            <td>Special Defense</td>
                            <td class="infodata">${pokemon.stats.find(stat => stat.stat.name === 'special-defense').base_stat}</td>
                        </tr>
                        <tr>
                            <td>Speed</td>
                            <td class="infodata">${pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat}</td>
                        </tr>
                    </table>
                </div>
            </div>
            <button class="delete" onclick="deletePokemon(${index})">Delete</button>
        `;
        cardCollectionDiv.appendChild(pokemonDiv);
    });

    const accordions = document.getElementsByClassName("accordion");
    for (let i = 0; i < accordions.length; i++) {
        accordions[i].addEventListener("click", function() {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }
}

function getWeakness(types) {
    const weaknesses = {
        "normal": "Fighting",
        "fire": "Water",
        "water": "Electric",
        "electric": "Ground",
        "grass": "Fire",
        "ice": "Fire",
        "fighting": "Flying",
        "poison": "Ground",
        "ground": "Water",
        "flying": "Electric",
        "psychic": "Bug",
        "bug": "Fire",
        "rock": "Water",
        "ghost": "Ghost",
        "dragon": "Ice",
        "dark": "Fighting",
        "steel": "Fire",
        "fairy": "Poison"
    };

    let weaknessSet = new Set();
    types.forEach(type => {
        Object.keys(weaknesses).forEach(key => {
            if (type.type.name === key) {
                weaknessSet.add(weaknesses[key]);
            }
        });
    });

    return Array.from(weaknessSet).join(', ');
}

function displayPokemon(pokemon) {
    const pokemonContainer = document.getElementById('pokemonContainer');
    const pokemonDiv = document.createElement('div');
    let totalStats = 0;
    ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].forEach(statName => {
        const stat = pokemon.stats.find(stat => stat.stat.name === statName);
        totalStats += stat.base_stat;
    });

    pokemonDiv.classList.add('pokemon');
    pokemonDiv.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <div class="card">
            <span>Name:</span>
            <span class="infodata">${pokemon.name}</span>
        </div>
        <div class="card">
            <span>ID:</span>
            <span class="infodata">#${pokemon.id}</span>
        </div>
        <div class="card">
            <span>Type:</span>
            <span class="infodata">${pokemon.types.map(type => type.type.name).join(', ')}</span>
        </div>
        <div class="card">
            <span>Strength:</span>
            <span class="infodata">${totalStats}</span>
        </div>
    `;
    pokemonContainer.appendChild(pokemonDiv);
}

function showCardCollection() {
    const modal = document.getElementById('modal');
    modal.style.display = "block";
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = "none";
}

let isFilterActive = false;
document.getElementById('filterStrength').addEventListener('change', function() {
    const selectedFilter = this.value;
    if (selectedFilter === 'highest') {
        isFilterActive = true;
        filterByHighestStrength();
    } else {
        isFilterActive = false;
        updateCardCollection();
    }
});

function filterByHighestStrength() {
    const sortedPokemon = [...cardCollection].sort((a, b) => {
        const totalStatsA = calculateTotalStats(a.stats);
        const totalStatsB = calculateTotalStats(b.stats);
        return totalStatsB - totalStatsA;
    });
    updateCardCollection(sortedPokemon);
}

function calculateTotalStats(stats) {
    let totalStats = 0;
    stats.forEach(stat => {
        totalStats += stat.base_stat;
    });
    return totalStats;
}

function disableFilter() {
    isFilterActive = false;
    updateCardCollection();
}
