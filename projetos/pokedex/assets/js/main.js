const typeColors = {
  grass: '#49d0b0',
  fire: '#f76c5e',
  water: '#5ab0ff',
  poison: '#9d6bd4',
  electric: '#f7d14c',
  bug: '#8fd75d',
  ground: '#d9b36a',
  fairy: '#eb9be9',
  psychic: '#ff8bbd',
  fighting: '#d96b6b',
  rock: '#bca85d',
  ghost: '#6d76d8',
  dragon: '#7c6ef3',
  ice: '#84d9ff',
  normal: '#a8a878',
  steel: '#b8b8d0',
  dark: '#6a5248'
};

function darkenHex(hex, percent) {
  const value = hex.replace('#', '');
  const num = parseInt(value, 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, (num >> 16) - amt);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const b = Math.max(0, (num & 0x0000ff) - amt);

  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function formatPokemonNumber(number) {
  return `#${String(number).padStart(3, '0')}`;
}

function convertPokemonToCard(pokemon) {
  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const baseColor = typeColors[primaryType] || '#49d0b0';
  const secondaryColor = darkenHex(baseColor, 18);

  return `
    <li class="pokemon" style="--pokemon-bg: linear-gradient(135deg, ${baseColor} 0%, ${secondaryColor} 100%);">
      <span class="name">${pokemon.name}</span>
      <span class="number">${formatPokemonNumber(pokemon.id)}</span>

      <div class="detail">
        <ol class="types">
          ${pokemon.types.map((type) => `<li class="type">${type.type.name}</li>`).join('')}
        </ol>
        <img src="${pokemon.sprites.other.dream_world.front_default || pokemon.sprites.front_default}" alt="${pokemon.name}" />
      </div>
    </li>
  `;
}

function renderPokemons(pokemons) {
  const list = document.querySelector('.pokemons');

  if (!list) {
    return;
  }

  list.innerHTML = pokemons.map((pokemon) => `
    <li class="pokemon" data-id="${pokemon.id}" style="--pokemon-bg: linear-gradient(135deg, ${typeColors[pokemon.types[0]?.type.name] || '#49d0b0'} 0%, ${darkenHex(typeColors[pokemon.types[0]?.type.name] || '#49d0b0', 18)} 100%);">
      <span class="name">${pokemon.name}</span>
      <span class="number">${formatPokemonNumber(pokemon.id)}</span>

      <div class="detail">
        <ol class="types">
          ${pokemon.types.map((type) => `<li class="type">${type.type.name}</li>`).join('')}
        </ol>
        <img src="${pokemon.sprites.other.dream_world.front_default || pokemon.sprites.front_default}" alt="${pokemon.name}" />
      </div>
    </li>
  `).join('');
}

function fillPokemonModal(pokemon) {
  const modal = document.getElementById('pokemonModal');
  const modalCard = document.getElementById('pokemonModalCard');
  const modalNumber = document.getElementById('modalPokemonNumber');
  const modalName = document.getElementById('modalPokemonName');
  const modalTypes = document.getElementById('modalPokemonTypes');
  const modalImage = document.getElementById('modalPokemonImage');
  const modalHeight = document.getElementById('modalPokemonHeight');
  const modalWeight = document.getElementById('modalPokemonWeight');
  const modalStats = document.getElementById('modalPokemonStats');
  const modalAbilities = document.getElementById('modalPokemonAbilities');

  if (!modal || !modalCard || !modalNumber || !modalName || !modalTypes || !modalImage || !modalHeight || !modalWeight || !modalStats || !modalAbilities) {
    return;
  }

  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const baseColor = typeColors[primaryType] || '#49d0b0';
  const secondaryColor = darkenHex(baseColor, 18);

  modalCard.style.setProperty('--detail-bg', `linear-gradient(135deg, ${baseColor} 0%, ${secondaryColor} 100%)`);
  modalNumber.textContent = formatPokemonNumber(pokemon.id);
  modalName.textContent = pokemon.name;
  modalImage.src = pokemon.sprites.other.dream_world.front_default || pokemon.sprites.front_default;
  modalImage.alt = pokemon.name;
  modalHeight.textContent = `${(pokemon.height / 10).toFixed(1)} m`;
  modalWeight.textContent = `${(pokemon.weight / 10).toFixed(1)} kg`;

  modalTypes.innerHTML = pokemon.types.map((type) => `<li>${type.type.name}</li>`).join('');
  modalStats.innerHTML = pokemon.stats.map((stat) => `
    <li>
      <span>${stat.stat.name}</span>
      <strong>${stat.base_stat}</strong>
    </li>
  `).join('');

  modalAbilities.innerHTML = pokemon.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closePokemonModal() {
  const modal = document.getElementById('pokemonModal');

  if (!modal) {
    return;
  }

  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function openPokemonModal(pokemon) {
  const modal = document.getElementById('pokemonModal');

  if (!modal) {
    return;
  }

  fillPokemonModal(pokemon);
  document.body.style.overflow = 'hidden';
}

function setupPokemonDetails() {
  document.addEventListener('click', (event) => {
    const card = event.target.closest('.pokemon');

    if (card) {
      const pokemonId = Number(card.dataset.id);
      const pokemonData = window.pokemonData.find((pokemon) => pokemon.id === pokemonId);

      if (pokemonData) {
        openPokemonModal(pokemonData);
      }

      return;
    }

    const modal = document.getElementById('pokemonModal');
    if (modal && event.target === modal) {
      closePokemonModal();
    }
  });

  const closeButton = document.getElementById('closePokemonModal');
  if (closeButton) {
    closeButton.addEventListener('click', closePokemonModal);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const modal = document.getElementById('pokemonModal');
      if (modal && !modal.classList.contains('hidden')) {
        closePokemonModal();
      }
    }
  });
}

async function loadPokemonList() {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=150&offset=0');
  const data = await response.json();

  const pokemonPromises = data.results.map(async (pokemon) => {
    const pokemonResponse = await fetch(pokemon.url);
    return pokemonResponse.json();
  });

  const pokemons = await Promise.all(pokemonPromises);
  window.pokemonData = pokemons;
  renderPokemons(pokemons);
  setupPokemonDetails();
}

loadPokemonList();
