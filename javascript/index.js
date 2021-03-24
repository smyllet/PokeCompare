let pokemonAutocomplete = []
let poke1 = {}
let poke2 = {}

$(document).ready(() => {
    let templateSearchPokemon = $('#TemplatePokemonSearch').html()
    let pokemon1 = $('#pokemon1')
    let pokemon2 = $('#pokemon2')

    pokemon1.html(templateSearchPokemon)
    pokemon2.html(templateSearchPokemon)

    getPokemonAutoComplete()

    setSearchEvent()

    $('#filtreAttaques input[type=checkbox]').on('change', () => {
        updatePokemonMoves()
    })

    $('#filtreAttaques input[type=text]').on('input', () => {
        updatePokemonMoves()
    })
})

function setSearchEvent() {
    let pokemon1 = $('#pokemon1')
    let pokemon2 = $('#pokemon2')

    $('.pokemonSearch input').typeahead({
        menu: '<ul class="typeahead dropdown-menu dropdown-menu-scroll" role="listbox"></ul>',
        item: '<li><a class="dropdown-item" href="#" role="option"></a></li>',
        autoSelect: true,
        source: function (query, callback) { callback(pokemonAutocomplete) },
        afterSelect: function() {
            // Désactivé le focus sur le champs de saisie en cas de sélection via l'autocomplétion
            setTimeout(() => {
                let poke1Input = $('#pokemon1 input')
                let poke2Input = $('#pokemon2 input')

                if(poke1Input.is(':focus')) {
                    poke1Input.blur()
                }
                else if(poke2Input.is(':focus')) {
                    poke2Input.blur()
                }
            },1)
        }
    })

    // Retiré le focus quand la touche entré est pressé
    $('.pokemonSearch input').on('keypress', (e) => {
        if(e.which === 13) {
            $(e.currentTarget).blur()
        }
    })

    let timeoutPk1
    $('#pokemon1 input').on('focusout', (e) => {
        clearTimeout(timeoutPk1)
        timeoutPk1 = setTimeout(() => {
            let current = $(e.currentTarget)
            searchPokemon(pokemon1, current.val(), 1)
        }, 100)
    })

    let timeoutPk2
    $('#pokemon2 input').on('focusout', (e) => {
        clearTimeout(timeoutPk2)
        timeoutPk2 = setTimeout(() => {
            let current = $(e.currentTarget)
            searchPokemon(pokemon2, current.val(), 2)
        }, 100)
    })
}

function searchPokemon(container, pokemon, compare_part) {
    container.find('.error-input').html('')
    if(pokemon.length > 0) {
        axios({
            method: 'get',
            url: `https://pokeapi.co/api/v2/pokemon/${pokemon}`
        }).then(response => {
            if(compare_part === 1) {
                poke1 = response.data
            }
            else if(compare_part === 2) {
                poke2 = response.data
            }

            let template = $($('#TemplatePokemonResult').html())
            template.find('.pokemonResultName').html(response.data.name)
            axios({
                method: 'get',
                url: response.data.species.url
            }).then(res => {
                template.find('.pokemonResultName').append(` (${res.data.names.find(name => name.language.name === 'fr').name})`)
                template.find('.pokemonResultText').html(res.data.flavor_text_entries.find(text => text.language.name === 'fr').flavor_text)
            })
            template.find('.pokemonResultPicture').attr('src', getPictureLink(response.data.id))

            // Type du Pokémon
            response.data.types.forEach(type => {
                template.find('.PokemonResultType').append(`<span class="${type.type.name}">${type.type.name}</span>`)
            })

            // Information du Pokémon
            template.find('.pokemonResultInformationBaseExperience').html(response.data.base_experience)
            template.find('.pokemonResultInformationHeight').html(response.data.height)
            template.find('.pokemonResultInformationWeight').html(response.data.weight)

            // Statistique du Pokémon
            template.find('.pokemonResultStatsHP').html(response.data.stats.find(stat => stat.stat.name === "hp").base_stat)
            template.find('.pokemonResultStatsAttack').html(response.data.stats.find(stat => stat.stat.name === "attack").base_stat)
            template.find('.pokemonResultStatsDefense').html(response.data.stats.find(stat => stat.stat.name === "defense").base_stat)
            template.find('.pokemonResultStatsSpecialAttack').html(response.data.stats.find(stat => stat.stat.name === "special-attack").base_stat)
            template.find('.pokemonResultStatsSpecialDefense').html(response.data.stats.find(stat => stat.stat.name === "special-defense").base_stat)
            template.find('.pokemonResultStatsSpeed').html(response.data.stats.find(stat => stat.stat.name === "speed").base_stat)

            // Bouton Supprimer
            template.find('.pokemonResultRemove').on('click', () => {
                let templateSearchPokemon = $('#TemplatePokemonSearch').html()

                if(compare_part === 1) {
                    poke1 = {}
                }
                else if(compare_part === 2) {
                    poke2 = {}
                }

                container.html(templateSearchPokemon)
                setSearchEvent()
                actuPokemonStats()
                updatePokemonMoves()
            })

            container.html(template)

            actuPokemonStats()
            updatePokemonMoves()
        }).catch((error) => {
            container.find('.error-input').html('Pokémon introuvable')
        })
    }
}

function getPokemonAutoComplete() {
    axios({
        method: 'get',
        url: `https://pokeapi.co/api/v2/pokemon?limit=900`
    }).then(response => {
        pokemonAutocomplete = response.data.results.map(pokemon => pokemon.name)
    }).catch((error) => {
        console.error(error)
    })
}

function getPictureLink(id) {
    id = "" + id

    while (id.length < 3) {
        id = "0" + id
    }

    return `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id}.png`
}

function actuPokemonStats() {
    $('.pokemonResultStats span').removeClass('low_stat')
    $('.pokemonResultStats span').removeClass('hight_stat')
    $('.pokemonResultStats span').removeClass('same_stat')

    if(poke1.stats && poke2.stats) {
        let poke1_hp = poke1.stats.find(stat => stat.stat.name === "hp").base_stat
        let poke2_hp = poke2.stats.find(stat => stat.stat.name === "hp").base_stat
        updateAStat('.pokemonResultStatsHP', poke1_hp, poke2_hp)

        let poke1_attack = poke1.stats.find(stat => stat.stat.name === "attack").base_stat
        let poke2_attack = poke2.stats.find(stat => stat.stat.name === "attack").base_stat
        updateAStat('.pokemonResultStatsAttack', poke1_attack, poke2_attack)

        let poke1_defense = poke1.stats.find(stat => stat.stat.name === "defense").base_stat
        let poke2_defense = poke2.stats.find(stat => stat.stat.name === "defense").base_stat
        updateAStat('.pokemonResultStatsDefense', poke1_defense, poke2_defense)

        let poke1_special_attack = poke1.stats.find(stat => stat.stat.name === "special-attack").base_stat
        let poke2_special_attack = poke2.stats.find(stat => stat.stat.name === "special-attack").base_stat
        updateAStat('.pokemonResultStatsSpecialAttack', poke1_special_attack, poke2_special_attack)

        let poke1_special_defense = poke1.stats.find(stat => stat.stat.name === "special-defense").base_stat
        let poke2_special_defense = poke2.stats.find(stat => stat.stat.name === "special-defense").base_stat
        updateAStat('.pokemonResultStatsSpecialDefense', poke1_special_defense, poke2_special_defense)

        let poke1_speed = poke1.stats.find(stat => stat.stat.name === "speed").base_stat
        let poke2_speed = poke2.stats.find(stat => stat.stat.name === "speed").base_stat
        updateAStat('.pokemonResultStatsSpeed', poke1_speed, poke2_speed)
    }
}

function updateAStat(statClass, stat1, stat2) {
    if(stat1 > stat2) {
        $(`#pokemon1 ${statClass}`).addClass('hight_stat')
        $(`#pokemon2 ${statClass}`).addClass('low_stat')
    }
    else if(stat1 < stat2) {
        $(`#pokemon2 ${statClass}`).addClass('hight_stat')
        $(`#pokemon1 ${statClass}`).addClass('low_stat')
    }
    else {
        $(`#pokemon2 ${statClass}`).addClass('same_stat')
        $(`#pokemon1 ${statClass}`).addClass('same_stat')
    }
}

function updatePokemonMoves() {
    let pokemon1 = $('#pokemon1')
    let pokemon2 = $('#pokemon2')

    if(poke1.moves) setPokemonMoves(pokemon1, poke1.moves)
    if(poke2.moves) setPokemonMoves(pokemon2, poke2.moves)
}

function setPokemonMoves(container, moves) {
    let movesFiltered

    movesFiltered = moves.filter(move => {
        let valide = true

        let search = $('#filtreAttaquesSearch').val().toLowerCase()

        if((search.length > 0) && !move.move.name.toLowerCase().includes(search)) valide = false
        else if(poke1.moves && poke2.moves) {
            if(!$('#filtreAttaquesSameAttack').prop('checked') && poke1.moves.find(m => m.move.name === move.move.name) && poke2.moves.find(m => m.move.name === move.move.name)) valide = false
            else if(!$('#filtreAttaquesDifAttack').prop('checked') && !(poke1.moves.find(m => m.move.name === move.move.name) && poke2.moves.find(m => m.move.name === move.move.name))) valide = false
        }

        return valide
    })

    container.find('.pokemonResultMoves').html('')

    movesFiltered.forEach(move => {
        let template = $($('#TemplatePokemonResultMoveDiv').html())
        template.find('.pokemonResultMoveShortName').html(move.move.name)

        template.on('click', () => {
            if(template.hasClass('active')) {
                template.removeClass('active')
            }
            else {
                template.addClass('active')
                if(!template.hasClass('generate')) {
                    axios({
                        method: 'get',
                        url: move.move.url
                    }).then(response => {
                        template.find('.pokemonResultMoveDetailDescription').html(response.data.flavor_text_entries.filter(text => text.language.name === "fr").pop().flavor_text)
                        template.find('.pokemonResultMoveDetailDamageType').html(response.data.damage_class.name)
                        template.find('.pokemonResultMoveDetailPrecision').html(response.data.accuracy)
                        template.find('.pokemonResultMoveDetailDamage').html((response.data.power) ? response.data.power : 0)
                        template.find('.pokemonResultMoveDetailPP').html(response.data.pp)
                        template.addClass('generate')

                        console.log(response.data)
                    }).catch((error) => {
                        console.error(error)
                    })
                }
            }
        })

        container.find('.pokemonResultMoves').append(template)
    })

    container.find('.pokemonResultMovesNB').html(`(${movesFiltered.length}/${moves.length})`)
}