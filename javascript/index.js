// - - - - - Variable - - - - - //
let pokemonAutocomplete = []
let poke1 = {}
let poke2 = {}
let moveCache = {}

// - - - - - Exécution une fois que la page à chargé - - - - - //
$(document).ready(() => {
    // Récupération des deux partie d'affichage
    let pokemon1 = $('#pokemon1')
    let pokemon2 = $('#pokemon2')

    // Récupération du modèle des zones de recherche
    let templateSearchPokemon = $('#TemplatePokemonSearch').html()

    // Initialisation des zones de recherche
    pokemon1.html(templateSearchPokemon)
    pokemon2.html(templateSearchPokemon)

    // Récupération de la liste des Pokémon pour les champs de recherche auto-complété
    getPokemonAutoComplete()

    // Initialisation des évènements lié au zones de recherche
    setSearchEvent()

    // Initialisation des évènements lié au filtres
    setFiltreEvent()
})

// Fonction d'initialisation des évènements lié au zones de recherche
function setSearchEvent() {
    // Récupération des deux partie d'affichage
    let pokemon1 = $('#pokemon1')
    let pokemon2 = $('#pokemon2')

    // Récupération des champs de recherche
    let searchInput = $('.pokemonSearch input')

    // Initialisation de l'auto-complétion des champs de recherche
    searchInput.typeahead({
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
    searchInput.on('keypress', (e) => {
        if(e.which === 13) {
            $(e.currentTarget).blur()
        }
    })

    // Recherché le Pokémon lorsque le focus est quitté dans la recherche
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

// Fonction d'initialisation des évènements lié au filtres
function setFiltreEvent() {
    // Mettre à jours la liste des attaques des Pokémon lorsque une case est coché ou décoché dans les filtres d'attaques
    $('#filtreAttaques input[type=checkbox]').on('change', () => {
        updatePokemonMoves()
    })

    // Mettre à jours la liste des attaques des Pokémon lorsque du text est entré dans les filtres d'attaques
    $('#filtreAttaques input[type=text]').on('input', () => {
        updatePokemonMoves()
    })
}

// Fonction de recherche de Pokémon
function searchPokemon(container, pokemon, compare_part) {
    // Suppression des erreurs de recherche (si il y en a)
    container.find('.error-input').html('')

    // Si il y a bien du text de saisie
    if(pokemon.length > 0) {
        // Récupérer auprès de la pokéapi le pokémon demandé par l'utilisateur
        axios({
            method: 'get',
            url: `https://pokeapi.co/api/v2/pokemon/${pokemon}`
        }).then(response => {
            // Si un pokémon est bien retourné
            // Stocké les données du pokémon dans la variable correspondant à la zone de recherche
            if(compare_part === 1) {
                poke1 = response.data
            }
            else if(compare_part === 2) {
                poke2 = response.data
            }

            // Récupération du modèle de résultat
            let template = $($('#TemplatePokemonResult').html())

            // Ajout du nom du pokémon
            template.find('.pokemonResultName').html(response.data.name)

            // Récupération des informations détaillé du pokémon via la poké api (nom français et description pokédex)
            axios({
                method: 'get',
                url: response.data.species.url
            }).then(res => {
                // Ajout du nom français du pokémon
                template.find('.pokemonResultName').append(` (${res.data.names.find(name => name.language.name === 'fr').name})`)

                // Ajout de la description pokédex du pokémon
                template.find('.pokemonResultText').html(res.data.flavor_text_entries.find(text => text.language.name === 'fr').flavor_text)
            })

            // Récupération et ajout de la photo du Pokémon
            template.find('.pokemonResultPicture').attr('src', getPictureLink(response.data.id))

            // Ajout Type du Pokémon
            response.data.types.forEach(type => {
                template.find('.PokemonResultType').append(`<span class="${type.type.name}">${type.type.name}</span>`)
            })

            // Ajout information du Pokémon
            template.find('.pokemonResultInformationBaseExperience').html(response.data.base_experience)
            template.find('.pokemonResultInformationHeight').html(response.data.height)
            template.find('.pokemonResultInformationWeight').html(response.data.weight)

            // Ajout statistique du Pokémon
            template.find('.pokemonResultStatsHP').html(response.data.stats.find(stat => stat.stat.name === "hp").base_stat)
            template.find('.pokemonResultStatsAttack').html(response.data.stats.find(stat => stat.stat.name === "attack").base_stat)
            template.find('.pokemonResultStatsDefense').html(response.data.stats.find(stat => stat.stat.name === "defense").base_stat)
            template.find('.pokemonResultStatsSpecialAttack').html(response.data.stats.find(stat => stat.stat.name === "special-attack").base_stat)
            template.find('.pokemonResultStatsSpecialDefense').html(response.data.stats.find(stat => stat.stat.name === "special-defense").base_stat)
            template.find('.pokemonResultStatsSpeed').html(response.data.stats.find(stat => stat.stat.name === "speed").base_stat)

            // Initialisation du bouton de suppression du pokémon
            template.find('.pokemonResultRemove').on('click', () => {
                // Récupération du modèle des zones de recherche
                let templateSearchPokemon = $('#TemplatePokemonSearch').html()

                // Effacer les donnée lié au pokémon
                if(compare_part === 1) {
                    poke1 = {}
                }
                else if(compare_part === 2) {
                    poke2 = {}
                }

                // Initialisation de la zone de recherche
                container.html(templateSearchPokemon)

                // Récupération de la liste des Pokémon pour les champs de recherche auto-complété
                getPokemonAutoComplete()

                // Initialisation des évènements lié au zones de recherche
                setSearchEvent()

                // Actualisation des attaques des Pokémon
                updatePokemonMoves()

                // Actualisation des zones des Pokémon
                updatePokemonArea()
            })

            // Ajout du template du résultat dans la zone d'affichage du pokémon
            container.html(template)

            // Actualisation des statistiques des Pokémon
            actuPokemonStats()

            // Actualisation des attaques des Pokémon
            updatePokemonMoves()

            // Récupération et actualisation des zones des pokémon
            axios({
                method: 'get',
                url: response.data.location_area_encounters
            }).then(res => {
                if(compare_part === 1) {
                    poke1.areas = res.data
                }
                else if(compare_part === 2) {
                    poke2.areas = res.data
                }

                updatePokemonArea()
            })
        }).catch(() => {
            // En cas d'erreur, informé l'utilisateur que le Pokémon est introuvable
            container.find('.error-input').html('Pokémon introuvable')
        })
    }
}

// Fonction de récupération de l'auto-complétion
function getPokemonAutoComplete() {
    // Récupération de la liste des pokémon via la pokéapi
    axios({
        method: 'get',
        url: `https://pokeapi.co/api/v2/pokemon?limit=900`
    }).then(response => {
        // Récupération de la liste des nom et ajout dans la variable d'auto complétion
        pokemonAutocomplete = response.data.results.map(pokemon => pokemon.name)
    }).catch((error) => {
        console.error(error)
    })
}

// Fonction de génération du lien de l'image d'un Pokémon
function getPictureLink(id) {
    // Mise sur 3 caractère du numéro de pokédex
    id = "" + id
    while (id.length < 3) {
        id = "0" + id
    }

    // Envoie du lien pokemon.com de l'image d'un pokémon
    // (L'image du Pokémon n'est pas récupéré via la pokéapi car de trop faible qualité)
    return `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id}.png`
}

// Actualisation de la couleur des statistiques des Pokémon
function actuPokemonStats() {
    // Effacer les couleurs actuel des stats
    let statSpan = $('.pokemonResultStats span')
    statSpan.removeClass('low_stat')
    statSpan.removeClass('hight_stat')
    statSpan.removeClass('same_stat')

    // Si les stats des deux Pokémon à comparé sont bien présente, Récupéré chaque stats et la mettre à jours
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

// Fonction de mise en couleur d'un statistique d'un Pokémon
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

// Fonction de mise à jour de l'affichage des attaques des Pokémon
function updatePokemonMoves() {
    // Récupération des deux partie d'affichage
    let pokemon1 = $('#pokemon1')
    let pokemon2 = $('#pokemon2')

    // Si les attaques du Pokémon sont stocké, les metres à jours
    if(poke1.moves) setPokemonMoves(pokemon1, poke1.moves)
    if(poke2.moves) setPokemonMoves(pokemon2, poke2.moves)
}

// Fonction de mise à jour des attaques d'un pokémon
function setPokemonMoves(container, moves) {
    // Variable qui contiendra la liste des attaques filtré
    let movesFiltered

    // Filtre des attaques
    movesFiltered = moves.filter(move => {
        // Par défaut, l'attaques est valide
        let valide = true

        // Récupération du filtre de recherche d'attaque
        let search = $('#filtreAttaquesSearch').val().toLowerCase()

        // Si le filtre de recherche contient bien du text et que celui-ci n'est pas présent dans le nom de l'attaque, on ne valide pas l'attaque
        if((search.length > 0) && !move.move.name.toLowerCase().includes(search)) valide = false
        // Sinon si ils y a bien les attaques pour les deux pokémon à comparer
        else if(poke1.moves && poke2.moves) {
            // Si l'on ne souhaite pas les attaques en commune et que l'attaque ce trouve dans les deux Pokémon, on ne valide pas l'attaque
            if(!$('#filtreAttaquesSameAttack').prop('checked') && poke1.moves.find(m => m.move.name === move.move.name) && poke2.moves.find(m => m.move.name === move.move.name)) valide = false
            // Sinon si l'on ne souhaite pas les attaques en unique à chaque pokémon et que c'est le cas, on ne valide pas l'attaque
            else if(!$('#filtreAttaquesDifAttack').prop('checked') && !(poke1.moves.find(m => m.move.name === move.move.name) && poke2.moves.find(m => m.move.name === move.move.name))) valide = false
        }

        // Retourner si l'attaque correspond au critères de filtres ou non
        return valide
    })

    // Effacer les attaques actuellement affiché
    container.find('.pokemonResultMoves').html('')

    // Pour chaque attaques contenue dans la liste des attaques filtré
    movesFiltered.forEach(move => {
        // Récupéré le modèle d'une attaque
        let template = $($('#TemplatePokemonResultMoveDiv').html())

        // Ajout du nom
        template.find('.pokemonResultMoveShortName').html(move.move.name)

        // Quand l'utilisateur click sur l'attaque
        template.on('click', async () => {
            // Si elle possède la classe active
            if(template.hasClass('active')) {
                // Supprimer la classe active
                template.removeClass('active')
            }
            // Sinon
            else {
                // Ajouter la classe active
                template.addClass('active')

                let moves;
                // Si le contenue n'est pas en cache
                if(!moveCache[move.move.name]) {
                    // Récupéré les information détaillé de l'attaque
                    await axios({
                        method: 'get',
                        url: move.move.url
                    }).then(response => {
                        moves = response.data
                        // Mise en cache de l'attaque
                        moveCache[move.move.name] = response.data
                    }).catch((error) => {
                        console.error(error)
                    })
                }
                // Sinon en récupère dans le cache
                else moves = moveCache[move.move.name]

                // Ajout de la description
                template.find('.pokemonResultMoveDetailDescription').html(moves.flavor_text_entries.filter(text => text.language.name === "fr").pop().flavor_text)
                // Ajout du type d'attaque
                template.find('.pokemonResultMoveDetailDamageType').html(moves.damage_class.name)
                // Ajout de la précision
                template.find('.pokemonResultMoveDetailPrecision').html(moves.accuracy)
                // Ajout des dégâts
                template.find('.pokemonResultMoveDetailDamage').html((moves.power) ? moves.power : 0)
                // Ajout du nombre de point de pouvoir
                template.find('.pokemonResultMoveDetailPP').html(moves.pp)
            }
        })

        // Ajout de l'attaque dans la liste des attaques du Pokémon
        container.find('.pokemonResultMoves').append(template)
    })

    // Mise à jour du nombre d'attaques afficher sur le nombre d'attaques total pour le Pokémon
    container.find('.pokemonResultMovesNB').html(`(${movesFiltered.length}/${moves.length})`)
}

// Fonction de mise à jour de l'affichage des zones des Pokémon
function updatePokemonArea() {
    // Récupération des deux partie d'affichage
    let pokemon1 = $('#pokemon1')
    let pokemon2 = $('#pokemon2')

    // Si les zones du Pokémon sont stocké, les metres à jours
    if(poke1.areas) setPokemonAreas(pokemon1, poke1.areas)
    if(poke2.areas) setPokemonAreas(pokemon2, poke2.areas)
}

// Fonction de mise à jour des attaques d'un pokémon
function setPokemonAreas(container, areas) {
    // Récupération des deux partie d'affichage
    let pokemon1 = $('#pokemon1')
    let pokemon2 = $('#pokemon2')

    // Effacer les attaques actuellement affiché
    container.find('.pokemonResultArea').html('')

    // Pour chaque zone contenue dans la liste des zones
    areas.forEach(area => {
        // Récupéré le modèle d'une zone
        let template = $($('#TemplatePokemonResultAreaDiv').html())

        // Ajout du nom
        template.find('.pokemonResultAreaShortName').html(readableAreaName(area.location_area.name))

        // Quand l'utilisateur click sur l'attaque
        template.on('click', async () => {
            // Si elle possède la classe active
            if(template.hasClass('active')) {
                // Supprimer la classe active
                template.removeClass('active')
            }
            // Sinon
            else {
                // Ajouter la classe active
                template.addClass('active')

                template.find('.pokemonResultAreaPokemonLoadLeft').on('click', () => {
                    loadPokemonAreaList(pokemon1, area, 1)
                })

                template.find('.pokemonResultAreaPokemonLoadRight').on('click', () => {
                    loadPokemonAreaList(pokemon2, area, 2)

                })
            }
        })

        // Ajout de l'attaque dans la liste des attaques du Pokémon
        container.find('.pokemonResultArea').append(template)
    })

    // Mise à jour du nombre d'attaques afficher sur le nombre d'attaques total pour le Pokémon
    container.find('.pokemonResultAreaNB').html(`(${areas.length}/${areas.length})`)
}

// Suppression des tiret et area dans le nom des zones
function readableAreaName(name) {
    return name.replace('-area', ' ').replaceAll('-', ' ')
}

function loadPokemonAreaList(container, area, compare_part) {
    // Récupération des pokémon de la zone
    axios({
        method: 'get',
        url: area.location_area.url
    }).then(res => {
        // Récupération du modèle des zones de recherche
        let templateAreaPokemonList = $($('#TemplateAreaPokemonList').html())

        // Effacer les donnée lié au pokémon
        if(compare_part === 1) {
            poke1 = {}
        }
        else if(compare_part === 2) {
            poke2 = {}
        }

        // Changer le nom de la zone
        templateAreaPokemonList.find('.AreaPokemonListAreaName').html(readableAreaName(res.data.name))

        console.log(res.data.pokemon_encounters)

        res.data.pokemon_encounters.forEach(pokemon => {
            let element = $(`<div>${pokemon.pokemon.name}</div>`)

            element.on('click', () => {
                searchPokemon(container, pokemon.pokemon.name, compare_part)
            })

            templateAreaPokemonList.find('.AreaPokemonListPokemons').append(element)
        })

        // Initialisation de la zone de recherche
        container.html(templateAreaPokemonList)

        // Actualisation des attaques des Pokémon
        updatePokemonMoves()

        // Actualisation des zones des Pokémon
        updatePokemonArea()

        // Actualisation des statistiques des Pokémon
        actuPokemonStats()
    })
}