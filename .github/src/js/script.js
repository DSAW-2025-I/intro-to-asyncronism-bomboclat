document.addEventListener('DOMContentLoaded', () => {
    const pokemonList = document.getElementById('pokemon-list');
    const loadingSection = document.getElementById('loading');
    const pokeCount = 1030; // Number of Pokémon to fetch

    const fetchPokemons = async () => {
        for (let i = 1; i <= pokeCount; i++) {
            await getPokemon(i);
        }
    };

    const getPokemon = async (id) => {
        const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
        const res = await fetch(url);
        const pokemon = await res.json();
        await getPokemonSpecies(pokemon);
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

        card.innerHTML = `
            <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${name}">
            <h2>${name}</h2>
            <h3 class="pokemon-id">#${id}</h3>
            <button class="toggle-details">Toggle Details</button>
            <div class="pokemon-details" style="display: none;">
                <p>Type: ${pokemon.types.map(typeInfo => typeInfo.type.name).join('/')}</p>
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

    fetchPokemons().then(() => {
        loadingSection.style.display = 'none';
    }).catch(error => {
        console.error('Error fetching Pokémon data:', error);
    });
});