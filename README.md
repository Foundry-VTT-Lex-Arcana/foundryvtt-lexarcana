This project is not official and hence is supported neither by Foundry VTT &trade; nor by Lex Arcana &trade;.

# Rolls
Due to the nature of Lex Arcana rolls, in order to avoid decision time for players we cut the rolls in five distinct possibilities
## The custom roll
You get to decide the composition of your roll for this ability
## The 1,2,3 dices roll
The system will compute the expression for the roll closest to the ability stats and using 1,2 or 3 dices
## 1,2,3 dices balanced and unbalanced
We added a balanced/unbalanced mode that will allow you to chose to either use similar dices or very different dices
The system in unbalanced mode will try to find the greatest dice that will fit you wish (ability & number of dices) then if needed, he will try to fill the next dices with the rest of the points available.
The balanced mode works the same, but the system will try to keep the dices almost with the same number of faces.

Example: for a roll of 18 of Ingenium
Balanced mode with 3 dices: 3d6
Unbalanced mode with 3 dices: 1d12+1d3+1d3

# Versions
## 0.0.4
* Fixed rituals/indigamenta crash on opening sheets

## 0.0.3
* Complete rolling API overhaul
* Design overhaul

## 0.0.2
* Fixed custom rolls - spotted architecture weird things, gotta improve this in later versions
* Fixed rituals/indigamenta issues
* Fixed CSS issues
* Compatibility with Foundry VTT v9.0

## Prior 0.0.1
Alpha version, Custos character sheet base, items base and rituals/indigamenta not working

# Credits
