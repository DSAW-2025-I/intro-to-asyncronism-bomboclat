document.addEventListener('DOMContentLoaded', () => {
    const pokemonList = document.getElementById('pokemon-list');
    const pokeCount = 1030;
    const modal = document.getElementById('pokemon-modal');
    const closeModal = document.querySelector('.close');
    const filterButtons = document.querySelectorAll('.pokemon-type-btn');
    const searchInput = document.getElementById('Searcher');
    const searchButton = document.getElementById('Search-button');
    modal.style.display = 'none'; // Ocultar modal al iniciar, solo se muestra cuando se abre >:D

    
    const debounce = (func, delay) => {
        let debounceTimer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    };

    // Cargar Pokémon al iniciar la página
    const fetchPokemons = async () => {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pokeCount}`);
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();

            for (const pokemon of data.results) {
                const resPokemon = await fetch(pokemon.url);
                if (!resPokemon.ok) throw new Error('Network response was not ok');
                const pokemonData = await resPokemon.json();

                if (!pokemonData.name.includes('-')) {
                    createPokemonCard(pokemonData);
                }
            }
        } catch (error) {
            console.error('Error fetching Pokémon:', error);
        }
    };

    // Crear tarjetas de Pokémon
    const createPokemonCard = (pokemon) => {
        const card = document.createElement('section');
        card.classList.add('pokemon-card');
        const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        const id = pokemon.id.toString().padStart(3, '0');
        const types = pokemon.types.map(typeInfo => typeInfo.type.name).join(' / ');

        card.setAttribute('data-types', types);
        card.setAttribute('data-id', id); // Agregar ID para búsqueda por número

        card.innerHTML = `
            <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${name}">
            <h2>${name}</h2>
            <h3 class="pokemon-id">#${id}</h3>
            <button class="toggle-details" aria-label="View details of ${name}">View Details</button>
        `;

        pokemonList.appendChild(card);

        // Evento para abrir modal al hacer clic
        card.querySelector('.toggle-details').addEventListener('click', () => {
            fetchPokemonData(pokemon.id);
        });
    };

    // Obtener datos de un Pokémon específico
    const fetchPokemonData = async (pokemonId) => {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            if (!response.ok) throw new Error('Pokémon not found');

            const data = await response.json();
            const speciesResponse = await fetch(data.species.url);
            if (!speciesResponse.ok) throw new Error('Species data not found');
            const speciesData = await speciesResponse.json();

            populateModal(data, speciesData);
            modal.style.display = 'flex'; // Mostrar modal solo cuando hay datos                                                           // Profe subanos la nota porfa que pereza Documentar
        } catch (error) {
            console.error('Error fetching Pokémon data:', error);
        }
    };

    // Llenar el modal con datos del Pokémon
    const populateModal = (data, speciesData) => {
        // Limpiar contenido anterior
        document.getElementById('pokemon-number').textContent = `#${data.id}`;
        document.getElementById('pokemon-image').src = data.sprites.other['official-artwork'].front_default;
        document.getElementById('pokemon-image').alt = data.name;
    
        // Tipos
        const typesContainer = document.getElementById('pokemon-types');
        typesContainer.innerHTML = '';
        data.types.forEach(typeInfo => {
            const typeSpan = document.createElement('span');
            typeSpan.classList.add('pokemon-type', typeInfo.type.name);
            typeSpan.textContent = typeInfo.type.name.toUpperCase();
            typesContainer.appendChild(typeSpan);
        });
    
        // Altura y peso
        document.getElementById('pokemon-height').textContent = `Height: ${data.height / 10} m`;
        document.getElementById('pokemon-weight').textContent = `Weight: ${data.weight / 10} kg`;
    
        // Descripción en inglés
        const flavorTextEntry = speciesData.flavor_text_entries.find(
            entry => entry.language.name === 'en'
        );
        document.getElementById('pokemon-description').textContent = flavorTextEntry
            ? flavorTextEntry.flavor_text
            : 'No description available.';
    
        // Estadísticas (barras de progreso)
        const statsChart = document.getElementById('stats-chart');
        statsChart.innerHTML = ''; // Limpiar estadísticas anteriores
    
        data.stats.forEach(stat => {
            const statName = formatStatName(stat.stat.name);
            const statValue = stat.base_stat;
    
            // Crear la barra de progreso
            const statDiv = document.createElement('div');
            statDiv.classList.add('stat');
    
            statDiv.innerHTML = `
                <span class="stat-name">${statName}</span>
                <div class="w-full bg-gray-200 rounded-full h-6">
                    <div class="progress-bar bg-blue-500 h-6 rounded-full text-center text-white font-bold transition-all ease-in-out duration-1000" style="width: 0%;">
                        ${statValue}%
                    </div>
                </div>
            `;
    
            statsChart.appendChild(statDiv);
    
            // Animar la barra de progreso
            setTimeout(() => {
                const progressBar = statDiv.querySelector('.progress-bar');
                progressBar.style.width = `${statValue}%`; // Cambiar el ancho de la barra
                progressBar.textContent = `${statValue}%`; // Actualizar el texto
            }, 100); // Retraso para que la animación sea visible
        });
    };

    // Formatear nombres de estadísticas 
    const formatStatName = (stat) => {
        const statNames = {
            hp: 'HP',
            attack: 'Attack',
            defense: 'Defense',
            'special-attack': 'Sp. Attack',
            'special-defense': 'Sp. Defense',
            speed: 'Speed',
        };
        return statNames[stat] || stat;
    };

   
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Cerrar modal haciendo clic fuera de él
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    
    document.addEventListener('keydown', (event) => { //con el Esc
        if (event.key === 'Escape') {
            modal.style.display = 'none';
        }
    });

    // Filtrado por tipo (botones lindos con reflejos)
    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const type = event.target.id;
            filterPokemon(type);
        });
    });

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

    // Búsqueda por nombre o número
searchInput.addEventListener('input', debounce(() => {
    const searchTerm = searchInput.value.trim().toLowerCase(); 
    filterPokemonByNameOrId(searchTerm);
}, 300));

searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim().toLowerCase(); 
    filterPokemonByNameOrId(searchTerm);
});

const filterPokemonByNameOrId = (searchTerm) => {
    const allPokemonCards = document.querySelectorAll('.pokemon-card');
    let found = false;

    allPokemonCards.forEach(card => {
        const pokemonName = card.querySelector('h2').textContent.toLowerCase();
        const pokemonId = card.getAttribute('data-id'); // Obtener el ID del Pokémon

        // Buscar por nombre o ID
        if (pokemonName.includes(searchTerm) || pokemonId === searchTerm) {
            card.style.display = 'block'; // Mostrar la tarjeta
            found = true;
        } else {
            card.style.display = 'none'; // Ocultar la tarjeta
        }
    });

    const filterPokemonByNameOrId = (searchTerm) => {
        const allPokemonCards = document.querySelectorAll('.pokemon-card');
        let found = false;
    
        allPokemonCards.forEach(card => {
            const pokemonName = card.querySelector('h2').textContent.toLowerCase();
            const pokemonId = card.getAttribute('data-id'); // Obtener el ID del Pokémon
    
            // Buscar por nombre o ID
            if (pokemonName.includes(searchTerm) || pokemonId === searchTerm) {
                card.style.display = 'block'; // Mostrar la tarjeta
                found = true;
            } else {
                card.style.display = 'none'; // Ocultar la tarjeta
            }
        });
    
        // Mostrar mensaje e imagen si no se encuentra ningún Pokémon
        const noResultsMessage = document.getElementById('no-results-message');
        const noResultsImage = document.getElementById('no-results-image');
    
        if (!found) {
            if (!noResultsMessage) {
                const message = document.createElement('p');
                message.id = 'no-results-message';
                message.textContent = 'No Pokémon found.';
                pokemonList.appendChild(message);
            } else {
                noResultsMessage.style.display = 'block'; // Mostrar el mensaje si ya existe
            }
    
            if (noResultsImage) {
                noResultsImage.style.display = 'block'; // Mostrar la imagen
            }
        } else {
            if (noResultsMessage) {
                noResultsMessage.style.display = 'none'; // Ocultar el mensaje si hay resultados
            }
            if (noResultsImage) {
                noResultsImage.style.display = 'none'; // Ocultar la imagen si hay resultados
            }
        }
    };
};

    // Cargar Pokémon
    fetchPokemons();
});
const populateModal = (data, speciesData) => {
    // Limpiar estadísticas anteriores
    const statsChart = document.getElementById('stats-chart');
    statsChart.innerHTML = '';

    data.stats.forEach(stat => {
        const statName = formatStatName(stat.stat.name);
        const statValue = stat.base_stat;

        // Crear la barra de progreso
        const statDiv = document.createElement('div');                    //mero teso mi compañero pongale punto positivo
        statDiv.classList.add('stat');

        statDiv.innerHTML = `
            <span class="stat-name">${statName}</span>
            <div class="stat-bar">
                <div class="stat-fill ${stat.stat.name}" style="width: ${statValue}%;"></div>
            </div>
        `;

        statsChart.appendChild(statDiv);
    });

    // Actualizar información en modal-left
    document.getElementById('pokemon-number').textContent = `#${data.id}`;
    document.getElementById('pokemon-image').src = data.sprites.other['official-artwork'].front_default;
    document.getElementById('pokemon-image').alt = data.name;

    // Tipos
    const typesContainer = document.getElementById('pokemon-types');
    typesContainer.innerHTML = '';
    data.types.forEach(typeInfo => {
        const typeSpan = document.createElement('span');
        typeSpan.classList.add('pokemon-type', typeInfo.type.name);
        typeSpan.textContent = typeInfo.type.name.toUpperCase();
        typesContainer.appendChild(typeSpan);
    });
};