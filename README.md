# Poké Compare

Poké Compare est un site permettant de comparer, deux Pokémon entre eux

## Fonctionnalité
### Recherche
- 2 zones de recherche de Pokémon
- Champ de recherche auto-complété avec la liste des Pokémon
- Recherche de Pokémon par leurs numéros de Pokédex national ou par leurs noms (en anglais uniquement)

### Résultat
- Photo du Pokémon
- Nom en anglais (et en français)
- Description Pokédex
- Type(s) du Pokémon
- Informations du Pokémon (expérience de base, taille, poids)
- Statistiques du Pokémon (points de vie, attaque, défense, attaque spéciale, défense spéciale, vitesse) de différentes couleurs suivant le résultat de la comparaison avec celles de l'autre Pokémon
- Liste des attaques (en anglais) avec le nombre affiché sur le nombre total (en cas de filtres)
- Bouton supprimer pour revenir à la recherche

### Attaque
- Attaque cliquable pour afficher le détail
- Description de l'attaque
- Type d'attaque (physique, spécial, statut, ...)
- Précision de l'attaque
- Dégâts infligés
- Nombre de points de pouvoir

### Filtres
- Afficher les attaques en commun entre les deux Pokémon
- Afficher les attaques uniques à chaque Pokémon
- Recherche les attaques incluant une chaîne de caractère

## Installation
Déposer le projet dans un serveur web ou lancer le projet avec docker-compose *(attention : dû à l'utilisation de nginx, il y a des problèmes de mise en cache du css et javascript)* au moyen de la commande `docker-compose up`