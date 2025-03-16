document.addEventListener('DOMContentLoaded', () => {
    const pokemonList = document.getElementById('pokemon-list');
    const loadingSection = document.getElementById('loading');
    const pokeCount = 1030; 
    const filterButtons = document.querySelectorAll('.pokemon-type-btn'); 

    const fetchPokemons = async () => {
        const url = `https://pokeapi.co/api/v2/pokemon?limit=${pokeCount}`;
        const res = await fetch(url);
        const data = await res.json();

        for (const pokemon of data.results) {
            const resPokemon = await fetch(pokemon.url);
            const pokemonData = await resPokemon.json();

        
            if (!pokemonData.name.includes('-')) {
                await getPokemonSpecies(pokemonData);
            }
        }
    };

    const getPokemonSpecies = async (pokemon) => {
        const url = `https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`;
        const res = await fetch(url);
        const species = await res.json();
        createPokemonCard(pokemon, species);
    };

    const createPokemonCard = (pokemon, species) => {
        const card = document.createElement('section');
        card.classList.add('pokemon-card');
        const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        const id = pokemon.id.toString().padStart(3, '0');
        const types = pokemon.types.map(typeInfo => typeInfo.type.name);
        const typesString = types.join(' / ');

        card.setAttribute('data-types', types.join(' ')); 

        card.innerHTML = `
            <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${name}">
            <h2>${name}</h2>
            <h3 class="pokemon-id">#${id}</h3>
            <button class="toggle-details">Toggle Details</button>
            <div class="pokemon-details" style="display: none;">
                <p>Type: ${typesString}</p>
                <p>Height: ${pokemon.height / 10}m</p>
                <p>Weight: ${pokemon.weight / 10}kg</p>
                <p>Base Experience: ${pokemon.base_experience}</p>
                <p>Abilities: ${pokemon.abilities.map(abilityInfo => abilityInfo.ability.name).join(', ')}</p>
                <p>Habitat: ${species.habitat ? species.habitat.name : 'Unknown'}</p>
                <p>Color: ${species.color.name}</p>
            </div>
        `;

        pokemonList.appendChild(card);

        const toggleButton = card.querySelector('.toggle-details');
        toggleButton.addEventListener('click', () => {
            const details = card.querySelector('.pokemon-details');
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        });
    };

    //filtro arreglado
    const filterPokemon = (type) => {
        const allPokemonCards = document.querySelectorAll('.pokemon-card');

        allPokemonCards.forEach(card => {
            const pokemonTypes = card.getAttribute('data-types').split(' ');

          
            if (type === 'all' || pokemonTypes.some(t => t.toLowerCase() === type.toLowerCase())) {
                card.style.display = 'block'; 
            } else {
                card.style.display = 'none'; 
            }
        });
    };

    
    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const type = event.target.id; 
            filterPokemon(type);
        });
    });

    fetchPokemons().then(() => {
        loadingSection.style.display = 'none';
    }).catch(error => {
        console.error('Error fetching Pokémon data:', error);
    });
});
