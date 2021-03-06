/*jshint esversion:6*/

/*globals $, Joueur, Interface, Grille */

$(document).ready(function() {

    "use strict";
    if ("filter" in document.body.style) {
        console.log("Filter compatible");
        console.log(document.body.style.filter);
    } else {
        console.log("Filter non compatible");
    }

    // Définition height

    $("h1").css("display", "block"); // Pour éviter que le titre soit affiché avant de charger la grille & l'interface

    var nom_j1 = prompt("Entrez le nom du joueur 1 : "),

        nom_j2 = prompt("Entrez le nom du joueur 2 : ");

    if (!nom_j1) {

        nom_j1 = "Joueur 1";

    }

    if (!nom_j2) {

        nom_j2 = "Joueur 2";

    }

    var joueur1 = new Joueur(1, nom_j1),
        joueur2 = new Joueur(2, nom_j2),
        joueur_actuel,
        combat = false,
        grille = new Grille(joueur1, joueur2),
        interface_jeu = new Interface(joueur1, joueur2),
        nb_tours = 0; // Génération de la grille, initialisation de la position des joueurs

    // On affiche toute la page en même temps
    $("body").fadeIn(500);

    /* TRES TRES SALE, FAUT QUE JE TROUVE COMMENT AMELIORER CA */
    resizeGrid();

    $(window).resize(resizeGrid);

    // Commencement du jeu

    gestionTour();

    function resizeGrid() {
        if ($(document).width() < 580) {
            var $width = $("table").width(), // Largeur du tableau de jeu
                $td_width = Math.trunc($width / 11), // On récupère la valeur la plus proche en-dessous (0.6px n'auraient aucun sens)
                $final_width = $td_width * 11; // On recalcule la taille finale du tableau

            $("table").css({
                "height": `${$final_width}px`,
                "width": `${$final_width}px`
            });
            $("td").css({
                "height": `${$td_width}px`,
                "width": `${$td_width}px`
            });
        }
    }

    function deplacerJoueur(e) {

        $(".dep_possible").off("click", deplacerJoueur);

        var position = e.target.id.split("-"),

            anc_position = joueur_actuel.position;

        if (position.length !== 2) { // Si l'on clique sur l'image d'une arme, on recherche l'id du parent

            position = $(e.target).parent().attr("id").split("-");

        }

        var arme = grille.updatePosition(joueur_actuel, position); // On remet à jour la position du joueur sur la grille back

        if (arme !== -1) { // Si le joueur tombe sur une nouvelle arme

            joueur_actuel.updateArme(arme);

            interface_jeu.updateArme(joueur_actuel);

        }

        grille.updateGrilleEcran(joueur_actuel, anc_position, position, arme); // On remet à jour la grille front

        gestionTour();

    }

    function gestionTour() {

        joueur_actuel = grille.joueurs[nb_tours % 2];

        if (!combat) { // Étape 1 du jeu

            if (grille.estEnCombat()) {

                combat = true;

                gestionTour(); // On rappelle la fonction pour passer dans combat === true

            } else {

                var position = joueur_actuel.position;

                // On affiche les déplacements possibles du joueur

                grille.afficherDepDispos(position, deplacerJoueur);

                nb_tours += 1;

            }

        } else {

            if (joueur_actuel.pv === 0) { // On vérifie si le joueur actuel a encore des PV

                var vainqueur = grille.joueurs[(nb_tours + 1) % 2];

                alert(`${vainqueur.nom} a gagné !`);

            } else { // S'il en a, on continue le combat

                interface_jeu.genInterfaceCombat(joueur_actuel);

                $("#btn_attaque").on("click", gestionCombat);
                $("#btn_defense").on("click", gestionCombat);

            }

        }

    }

    function gestionCombat(e) { // Fonction callback de gestionTour en cas de combat

        $("button").off("click", gestionCombat);

        $("#boutons_combat").remove();

        nb_tours += 1;

        var decision = e.target.id.replace("btn_", "");

        if (decision === "defense") {

            joueur_actuel.updatePosture(false);

            gestionTour();

        } else {

            var ennemi = (joueur_actuel === joueur1) ? joueur2 : joueur1;

            ennemi.recevoirDegats(joueur_actuel.arme);

            joueur_actuel.updatePosture(true); // Puisqu'il a attaqué, on passe la posture du joueur en offensif

            interface_jeu.updateInterfaceCombat(ennemi, gestionTour);

        }

    }

});
