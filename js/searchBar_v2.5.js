///////////////// GLOBALE /////////////////
let formRecherche = document.getElementById("formSearch");
let loupe = formRecherche.children["loupe"];
let recherche = formRecherche.children["recherche"];
let listeSuggestion = document.getElementById("listeSuggestion");

//////// OUVRE/FERME LA BARRE de recherche aprés un click sur la loupe ////////
loupe.addEventListener("click", function () {
   deploimentHoriz(recherche);
});
//// Si l'input n'a plus le focus ... les suggestions sont cachées
recherche.addEventListener("blur", function () {
   //setTimeout execute la fonction 300ms apres sont appel
   setTimeout(function () {
      listeSuggestion.classList.remove("active");
   }, 300);
});
//// Si l'input a le focus ... les suggestions sont affichées
recherche.addEventListener("focus", function () {
   // s'affiche uniquement si elle n'est pas vide
   if (listeSuggestion.children.length !== 0) {
      listeSuggestion.classList.toggle("active");
   } else listeSuggestion.classList.remove("active");
});

//////// LANCER LA RECHERCHE avec la touche "Entree" (envoit du formulaire). ////////
/*//// Les events "key" contiennent un attribut (key) contenant la touche qui l'a déclanché. 
l'evenement "keyup" apparait une fois que la touche est remonté, donc aprés que le caractere 
soit tapé (contrairement a keypress et keydown)*/
recherche.addEventListener("keyup", function (eventKey) {
   //// ----- si touche échap ...
   if (eventKey.key === "Escape") {
      recherche.blur(); // on enleve le focus a l'input
      return;
   }
   //// ----- si touche "Entree" ...
   if (eventKey.key === "Enter") {
      listeSuggestion.classList.remove("active"); // cacher liste suggestions
      purgeSuggestion(listeSuggestion); // vider la liste
      formRecherche.submit();
   }
   //// ----- si autres touches ...
   else {
      // supprime les alertes d'erreurs pendant la modif du champ
      recherche.classList.remove("erreurChamp");

      ////////// entrées //////////
      let saisie = recherche.value; //demande d'origine
      //demande testé et remanier : prise en compte majuscules, chaine vide, espaces
      let saisieRegex = regexDynamique(saisie);
      let retourBd;

      //// controle entrées
      if (saisieRegex === "erreur") {
         listeSuggestion.classList.remove("active"); // cache la liste
         purgeSuggestion(listeSuggestion); // vide la liste
         return;
      } else {
         ////////// retour serveur //////////
         retourBd = rechercheServeur(saisieRegex /*, trueDicoM*/); // trueDicoM/table
         console.log("----- retourBD : ", retourBd); //--------------
      }

      ////////// traitement //////////
      //// Si != -1 -> au moins une correspondance
      if (retourBd !== -1) {
         //let textCorrespondance;
         let tabMatch = (tabContainerText = tabSpan = []);

         listeSuggestion.classList.add("active"); // rend la liste visible
         purgeSuggestion(listeSuggestion); // vide la liste

         //// Creation d'une suggestion par donnée dans la liste déroulante a chaque cycle
         for (let i = 0; i < retourBd.length; i++) {
            // "formatageChaine()" revele visuelement la correspondance au sein de la donnée retourné
            //"match" filtre les correspondances a chaque donnees retourné par le serveur (retourBd[i])
            creatSuggestion(
               listeSuggestion,
               formatageChaine(retourBd[i], retourBd[i].match(saisieRegex))
            );
         }
         return;
      }
      //// si le serveur n'a pas trouvé ...
      if (retourBd === -1) {
         console.log("rien trouvé !!!"); //------------
         listeSuggestion.classList.remove("active"); // cache la liste
         purgeSuggestion(listeSuggestion); // vide la liste

         return;
      }
   } //--------- fin else
});

//////// VERIFICATION des donnees avant de les soumettre au serveur ////////
/*formRecherche.addEventListener("submit", function (event) {
  event.preventDefault(); // arret de l'envoie du formulaire (MARCHE PAS !!!! ------------------------)
  let saisie = recherche.value;
  // regex ou chaines references
  let rules = "ok";

  // si la saisie est different du format ... erreur
  if (saisie != rules) {
    recherche.classList.add("erreurChamp");
    deploimentVertic(alertBox);
    
  }
});*/

///////////////// FONCTIONS /////////////////

//////// FONCTIONS LISTE DE SUGGESTIONS ////////

//// création regex majuscule/minuscule dynamique en fonction de la saisie
function regexDynamique(str) {
   let rgx = "";

   // si la saisie est vide ou egal uniquement a des espaces
   // /^[ ]{1,}$/ : regex qui cherche une chaine faite d'espaces
   if (str === "" || /^[ ]{1,}$/.test(str) === true) return "erreur";
   // pour chaque caracteres de la chaine une version minuscule et majuscule est crée
   for (let i = 0; i < str.length; i++) {
      if (/[0-9]/.test(str[i]) === true) rgx += str[i];
      else rgx += `[${str[i].toLowerCase()}${str[i].toUpperCase()}]`;
   }
   // création d'une regex avec le marqueur "g" indiquant a la methode "match" de récupérer toutes les correspondances
   return new RegExp(rgx, "g");
}
//// TEST serveur : Renvoit les elements qui contienent la correspondance ou un -1 si rien trouvé
function rechercheServeur(text /*, bdAlt*/) {
   let bd = ["légume", "abeille", "agneau", "aile", "âne", "arbre", "bain", "barque", "bassin", "bébé", "bec", "bêTe", "boeuf", "botte de fainte", "boue", "bouquet", "bourgeon", "crapaud", "cygne", "départ", "diNdon", "escargot", "étang", "ferme", "ferMier", "feuille", "flamme", "fleur", "fontaine", "fumée", "grain", "graine", "grenouille", "griffe", "Rat", "rivIère", "route", "tOrtUe", "tracTeur", "tulipe", "vache", "vétérinaire", "accompagner", "se baigner", "courir après", "couver", "donner à manger", "faire boire", "fumer", "griffer", "habiter", "piquer", "ramasser", "traire", "mie1", "2be", "Maïs", "île", "123456789", "3569821", "32a1zre6af"];
   let tabBd = [];

   //recherche de correspondance dans le contenu de la Bd
   for (let i = 0, y = 0; i < bd.length; i++) {
      if (text.test(bd[i]) != false) {
         tabBd[y] = bd[i];
         y++;
      }
   }
   // si le tableau de correspondance est vide ...
   if (tabBd.length === 0) return -1; // pas de correspondances

   return tabBd; // retourne les correspondances
}
//// Creation d'une suggestion
function creatSuggestion(liste, nom) {
   liste.innerHTML += `<li class="suggestion">
    <a class="lienSugg" href="https://google.com" target = "_blank">
      <img src="icon.png" alt="icon">
      <div class="zoneInfo">
        <span class="nom">${nom}</span>
        <span class="descrip">Description :  ...</span>
      </div>
    </a></li>`;
}
//// Vide toutes les suggestions de la liste pour un futur rafraichissement
function purgeSuggestion(liste) {
   let suggs = liste.querySelectorAll(".suggestion");

   for (let i = 0; i < suggs.length; i++) {
      suggs[i].remove();
   }
}
//// Formate (css) la chaine décrivant/représentant la suggestion
function formatageChaine(txtOrigin, tabCorresp) {
   let str;
   /* le "replace" releve les correspondances avec une balise (span) pour un formatage css mais 
  l'ecrase en meme temps, il faut donc les réinjecter par la suite (tabCorresp)*/
   for (let i = 0; i < tabCorresp.length; i++) {
      str = txtOrigin.replace(
         tabCorresp[i],
         "<span class='regexMatch'>" + tabCorresp[i] + "</span>"
      );
   }
   return str;
}

//////// FONCTIONS de FERMETURE/OUVERTURE d'un element ////////

//// version d'apparition directe
function deploiment(elem) {
   // si la class s'ajoute parce qu'elle est absente de cet element ...
   if (elem.classList.toggle("active")) {
      elem.focus(); // on lui donne le focus
   }
}
//// version progressive horizontale pour barre de recherche
function deploimentHoriz(elemInputRecherche) {
   // si la class s'ajoute parce qu'elle est absente de cet element ...
   if (elemInputRecherche.classList.toggle("animHorizontaleOuvrir")) {
      elemInputRecherche.focus(); // on lui donne le focus
   }
}
