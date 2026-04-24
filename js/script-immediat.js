let nbChoix = 0;
let totalQuestions = 0;
let currentQuestion = 1;
let totalPoints = 0;
let displayMode = "literal";

const champsTouches = {
    nbQuestions: false,
    nbChoix: false
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

function getSelectedValues(containerId) {
    const container = document.getElementById(containerId);
    const checkboxes = container.querySelectorAll("input[type='checkbox']:checked");
    return Array.from(checkboxes).map((checkbox) => parseInt(checkbox.value, 10));
}

function validerChampsQuestion(afficherMessages = true) {
    const selectedUser = getSelectedValues("userAnswers");
    const selectedOfficial = getSelectedValues("officialAnswers");

    let estValide = true;
    let erreurOfficialAnswers = "";
    let erreurQuestion = "";

    if (selectedOfficial.length === 0) {
        erreurOfficialAnswers = "Cochez au moins une bonne réponse dans la correction.";
        estValide = false;
    }

    if (selectedUser.length > nbChoix || selectedOfficial.length > nbChoix) {
        erreurQuestion = "Le nombre de choix cochés est invalide.";
        estValide = false;
    }

    if (afficherMessages) {
        afficherErreur("errorOfficialAnswers", erreurOfficialAnswers);
        afficherErreur("errorQuestion", erreurQuestion);
    }

    return estValide;
}

function mettreAJourEtatSetup() {
    document.getElementById("startBtn").disabled = !validerSetup(false);
}

function mettreAJourEtatQuestion() {
    document.getElementById("validerBtn").disabled = !validerChampsQuestion(false);
}

function toAlphabetLabel(index) {
    let value = index;
    let label = "";

    while (value > 0) {
        const remainder = (value - 1) % 26;
        label = String.fromCharCode(65 + remainder) + label;
        value = Math.floor((value - 1) / 26);
    }

    return label;
}

function getChoiceLabel(index) {
    if (displayMode === "numeric") {
        return String(index);
    }

    return toAlphabetLabel(index);
}

function creerOptionCheckbox(name, value, text) {
    const item = document.createElement("label");
    item.className = "choice-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = name;
    checkbox.value = String(value);

    const span = document.createElement("span");
    span.innerText = text;

    item.appendChild(checkbox);
    item.appendChild(span);

    return item;
}

function renderChoiceCheckboxes() {
    const userContainer = document.getElementById("userAnswers");
    const officialContainer = document.getElementById("officialAnswers");

    userContainer.innerHTML = "";
    officialContainer.innerHTML = "";

    for (let i = 1; i <= nbChoix; i++) {
        const label = getChoiceLabel(i);

        userContainer.appendChild(creerOptionCheckbox("userAnswer", i, label));
        officialContainer.appendChild(creerOptionCheckbox("officialAnswer", i, label));
    }

    const onQuestionInput = () => {
        mettreAJourEtatQuestion();
        validerChampsQuestion(true);
    };

    userContainer.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
        checkbox.addEventListener("change", onQuestionInput);
    });

    officialContainer.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
        checkbox.addEventListener("change", onQuestionInput);
    });
}

function setQuestionInputsDisabled(disabled) {
    ["userAnswers", "officialAnswers"].forEach((containerId) => {
        document.getElementById(containerId)
            .querySelectorAll("input[type='checkbox']")
            .forEach((checkbox) => {
                checkbox.disabled = disabled;
            });
    });
}

function initialiserValidationTempsReel() {
    ["nbQuestions", "nbChoix"].forEach((id) => {
        document.getElementById(id).addEventListener("input", () => {
            marquerChampCommeTouche(id);
            mettreAJourEtatSetup();
            validerSetup(true);
        });
    });

    document.getElementById("displayMode").addEventListener("change", () => {
        mettreAJourEtatSetup();
    });

    mettreAJourEtatSetup();
}

function startQCM() {
    if (!validerSetup(true)) {
        return;
    }

    totalQuestions = lireNombre("nbQuestions");
    nbChoix = lireNombre("nbChoix");
    displayMode = document.getElementById("displayMode").value;

    document.getElementById("setup").classList.add("hidden");
    document.getElementById("qcm").classList.remove("hidden");

    afficherQuestion();
}

function afficherQuestion() {
    document.getElementById("questionTitle").innerText = "Question " + currentQuestion + " :";
    document.getElementById("resultQuestion").innerText = "";

    renderChoiceCheckboxes();

    afficherErreur("errorOfficialAnswers", "");
    afficherErreur("errorQuestion", "");

    document.getElementById("validerBtn").disabled = true;
    document.getElementById("nextBtn").classList.add("hidden");
}

function validerQuestion() {
    if (!validerChampsQuestion(true)) {
        return;
    }

    const selectedUser = getSelectedValues("userAnswers");
    const selectedOfficial = getSelectedValues("officialAnswers");

    const bonnes = selectedOfficial.length;
    const officialSet = new Set(selectedOfficial);

    let correctes = 0;
    let fausses = 0;

    selectedUser.forEach((value) => {
        if (officialSet.has(value)) {
            correctes++;
        } else {
            fausses++;
        }
    });

    const count_point_response_question = 1 / bonnes;

    let point_response = 0;
    point_response += correctes * count_point_response_question;
    point_response -= fausses * count_point_response_question;

    if (point_response < 0) point_response = 0;
    if (point_response > 1) point_response = 1;

    totalPoints += point_response;

    document.getElementById("resultQuestion").innerText =
        "Points obtenus : " + point_response.toFixed(2) + " / 1";

    setQuestionInputsDisabled(true);
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

    const noteSur20 = (totalPoints / totalQuestions) * 20;

    document.getElementById("noteFinale").innerText =
        "Note finale : " + noteSur20.toFixed(2) + " / 20";
}

function resetQCM() {
    totalQuestions = 0;
    currentQuestion = 1;
    totalPoints = 0;
    nbChoix = 0;
    displayMode = "literal";

    document.getElementById("nbQuestions").value = "";
    document.getElementById("nbChoix").value = "";
    document.getElementById("displayMode").value = "literal";

    document.getElementById("resultFinal").classList.add("hidden");
    document.getElementById("qcm").classList.add("hidden");
    document.getElementById("setup").classList.remove("hidden");

    champsTouches.nbQuestions = false;
    champsTouches.nbChoix = false;

    afficherErreur("errorNbQuestions", "");
    afficherErreur("errorNbChoix", "");
    afficherErreur("errorOfficialAnswers", "");
    afficherErreur("errorQuestion", "");

    mettreAJourEtatSetup();
}

initialiserValidationTempsReel();

