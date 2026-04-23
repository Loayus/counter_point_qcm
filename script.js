let nbChoix = 0;
let totalQuestions = 0;
let currentQuestion = 1;
let totalPoints = 0;

const champsTouches = {
    nbQuestions: false,
    nbChoix: false,
    bonnes: false,
    correctes: false,
    fausses: false
};

function marquerChampCommeTouche(id) {
    const valeur = document.getElementById(id).value.trim();
    if (valeur !== "") {
        champsTouches[id] = true;
    }
}

function lireNombre(id) {
    const valeur = document.getElementById(id).value;
    if (valeur === "") return NaN;
    return parseInt(valeur, 10);
}

function afficherErreur(id, message) {
    document.getElementById(id).innerText = message;
}

function validerSetup(afficherMessages = true) {
    const nbQ = lireNombre("nbQuestions");
    const nbC = lireNombre("nbChoix");

    let estValide = true;
    let erreurNbQ = "";
    let erreurNbC = "";

    if (isNaN(nbQ) || nbQ <= 0) {
        erreurNbQ = "Entrez un nombre de questions valide (minimum 1).";
        estValide = false;
    }

    if (isNaN(nbC) || nbC <= 0) {
        erreurNbC = "Entrez un nombre de choix valide (minimum 1).";
        estValide = false;
    }

    if (afficherMessages) {
        afficherErreur("errorNbQuestions", champsTouches.nbQuestions ? erreurNbQ : "");
        afficherErreur("errorNbChoix", champsTouches.nbChoix ? erreurNbC : "");
    }

    return estValide;
}

function validerChampsQuestion(afficherMessages = true) {
    const bonnes = lireNombre("bonnes");
    const correctes = lireNombre("correctes");
    const fausses = lireNombre("fausses");

    let estValide = true;
    let erreurBonnes = "";
    let erreurCorrectes = "";
    let erreurFausses = "";
    let erreurQuestion = "";

    if (isNaN(bonnes) || bonnes <= 0) {
        erreurBonnes = "Nombre de bonnes réponses invalide.";
        estValide = false;
    } else if (bonnes > nbChoix) {
        erreurBonnes = "Le nombre de bonnes réponses ne peut pas dépasser " + nbChoix + ".";
        estValide = false;
    }

    if (isNaN(correctes) || correctes < 0) {
        erreurCorrectes = "Nombre de réponses correctes invalide.";
        estValide = false;
    }

    if (isNaN(fausses) || fausses < 0) {
        erreurFausses = "Nombre de réponses fausses invalide.";
        estValide = false;
    }

    if (!isNaN(bonnes) && !isNaN(correctes) && correctes > bonnes) {
        erreurQuestion = "Les réponses correctes ne peuvent pas dépasser les bonnes réponses.";
        estValide = false;
    } else if (!isNaN(correctes) && !isNaN(fausses) && (correctes + fausses) > nbChoix) {
        erreurQuestion = "Le total correctes + fausses ne peut pas dépasser " + nbChoix + ".";
        estValide = false;
    }

    if (afficherMessages) {
        afficherErreur("errorBonnes", champsTouches.bonnes ? erreurBonnes : "");
        afficherErreur("errorCorrectes", champsTouches.correctes ? erreurCorrectes : "");
        afficherErreur("errorFausses", champsTouches.fausses ? erreurFausses : "");

        const afficherErreurGlobale = champsTouches.bonnes || champsTouches.correctes || champsTouches.fausses;
        afficherErreur("errorQuestion", afficherErreurGlobale ? erreurQuestion : "");
    }

    return estValide;
}

function mettreAJourEtatSetup() {
    document.getElementById("startBtn").disabled = !validerSetup(false);
}

function mettreAJourEtatQuestion() {
    document.getElementById("validerBtn").disabled = !validerChampsQuestion(false);
}

function initialiserValidationTempsReel() {
    ["nbQuestions", "nbChoix"].forEach((id) => {
        document.getElementById(id).addEventListener("input", () => {
            marquerChampCommeTouche(id);
            mettreAJourEtatSetup();
            validerSetup(true);
        });
    });

    ["bonnes", "correctes", "fausses"].forEach((id) => {
        document.getElementById(id).addEventListener("input", () => {
            marquerChampCommeTouche(id);
            mettreAJourEtatQuestion();
            validerChampsQuestion(true);
        });
    });

    mettreAJourEtatSetup();
}

function startQCM() {
    if (!validerSetup(true)) {
        return;
    }

    totalQuestions = lireNombre("nbQuestions");
    nbChoix = lireNombre("nbChoix");

    document.getElementById("setup").classList.add("hidden");
    document.getElementById("qcm").classList.remove("hidden");

    afficherQuestion();
}

function afficherQuestion() {
    document.getElementById("questionTitle").innerText = "Question " + currentQuestion + " :";
    document.getElementById("bonnes").value = "";
    document.getElementById("correctes").value = "";
    document.getElementById("fausses").value = "";
    document.getElementById("resultQuestion").innerText = "";

    champsTouches.bonnes = false;
    champsTouches.correctes = false;
    champsTouches.fausses = false;

    afficherErreur("errorBonnes", "");
    afficherErreur("errorCorrectes", "");
    afficherErreur("errorFausses", "");
    afficherErreur("errorQuestion", "");

    document.getElementById("validerBtn").disabled = true;
    document.getElementById("nextBtn").classList.add("hidden");
}

function validerQuestion() {
    if (!validerChampsQuestion(true)) {
        return;
    }

    const bonnes = lireNombre("bonnes");
    const correctes = lireNombre("correctes");
    const fausses = lireNombre("fausses");

    const count_point_response_question = 1 / bonnes;

    let point_response = 0;
    point_response += correctes * count_point_response_question;
    point_response -= fausses * count_point_response_question;

    if (point_response < 0) point_response = 0;
    if (point_response > 1) point_response = 1;

    totalPoints += point_response;

    document.getElementById("resultQuestion").innerText =
        "Points obtenus : " + point_response.toFixed(2) + " / 1";

    document.getElementById("validerBtn").disabled = true;
    document.getElementById("nextBtn").classList.remove("hidden");
}

function nextQuestion() {
    currentQuestion++;

    if (currentQuestion > totalQuestions) {
        afficherResultatFinal();
    } else {
        afficherQuestion();
    }
}

function afficherResultatFinal() {
    document.getElementById("qcm").classList.add("hidden");
    document.getElementById("resultFinal").classList.remove("hidden");

    let noteSur20 = (totalPoints / totalQuestions) * 20;

    document.getElementById("noteFinale").innerText =
        "Note finale : " + noteSur20.toFixed(2) + " / 20";
}

function resetQCM() {
    totalQuestions = 0;
    currentQuestion = 1;
    totalPoints = 0;

    document.getElementById("nbQuestions").value = "";
    document.getElementById("nbChoix").value = "";

    document.getElementById("resultFinal").classList.add("hidden");
    document.getElementById("setup").classList.remove("hidden");

    champsTouches.nbQuestions = false;
    champsTouches.nbChoix = false;
    champsTouches.bonnes = false;
    champsTouches.correctes = false;
    champsTouches.fausses = false;

    afficherErreur("errorNbQuestions", "");
    afficherErreur("errorNbChoix", "");
    mettreAJourEtatSetup();
}

initialiserValidationTempsReel();
