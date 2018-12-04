"use strict";

var exports = module.exports = {};

const HEADER = [
    "Varste si grupe de varsta", 
    " Sexe", 
    " Medii de rezidenta", 
    " Macroregiuni  regiuni de dezvoltare si judete", 
    " Ani", 
    " UM: Numar persoane", 
    " Valoare"
];
const insseSexCategories = [ "Masculin", "Feminin" ];
const insseMediiRezidenta = [ "Total" , "Urban", "Rural" ];
const insseUM = [ "Numar persoane" ];
const insseAni = "Anul ";
const insseAgeCategories =  [
    "0- 4 ani", "0 ani", "1 ani", "2 ani", "3 ani", "4 ani", "5- 9 ani", "5 ani", "6 ani", "7 ani", "8 ani", "9 ani", 
    "10-14 ani", "10 ani", "11 ani", "12 ani", "13 ani", "14 ani", "15-19 ani", "15 ani", "16 ani", "17 ani", "18 ani", "19 ani", 
    "20-24 ani", "20 ani", "21 ani", "22 ani", "23 ani", "24 ani", "25-29 ani", "25 ani", "26 ani", "27 ani", "28 ani", "29 ani", 
    "30-34 ani", "30 ani", "31 ani", "32 ani", "33 ani", "34 ani", "35-39 ani", "35 ani", "36 ani", "37 ani", "38 ani", "39 ani", 
    "40-44 ani", "40 ani", "41 ani", "42 ani", "43 ani", "44 ani", "45-49 ani", "45 ani", "46 ani", "47 ani", "48 ani", "49 ani", 
    "50-54 ani", "50 ani", "51 ani", "52 ani", "53 ani", "54 ani", "55-59 ani", "55 ani", "56 ani", "57 ani", "58 ani", "59 ani", 
    "60-64 ani", "60 ani", "61 ani", "62 ani", "63 ani", "64 ani", "65-69 ani", "65 ani", "66 ani", "67 ani", "68 ani", "69 ani", 
    "70-74 ani", "70 ani", "71 ani", "72 ani", "73 ani", "74 ani", "75-79 ani", "75 ani", "76 ani", "77 ani", "78 ani", "79 ani", 
    "80-84 ani", "80 ani", "81 ani", "82 ani", "83 ani", "84 ani", "85 ani si peste"
];
const insseMacroregiuni = [ 
    "TOTAL", "MACROREGIUNEA UNU", "Regiunea NORD-VEST", "Bihor", "Bistrita-Nasaud", "Cluj", "Maramures", "Satu Mare", "Salaj", 
        "Regiunea CENTRU", "Alba", "Brasov", "Covasna", "Harghita", "Mures", "Sibiu", 
        "MACROREGIUNEA DOI", "Regiunea NORD-EST", "Bacau", "Botosani", "Iasi", "Neamt", "Suceava", "Vaslui", 
        "Regiunea SUD-EST", "Braila", "Buzau", "Constanta", "Galati", "Tulcea", "Vrancea", 
        "MACROREGIUNEA TREI", "Regiunea SUD-MUNTENIA", "Arges", "Calarasi", "Dambovita", "Giurgiu", "Ialomita", "Prahova", "Teleorman", 
        "Regiunea BUCURESTI - ILFOV", "Ilfov", "Municipiul Bucuresti", 
        "MACROREGIUNEA PATRU", "Regiunea SUD-VEST OLTENIA", "Dolj", "Gorj", "Mehedinti", "Olt", "Valcea", 
        "Regiunea VEST", "Arad", "Caras-Severin", "Hunedoara", "Timis" 
];

const ageIndex = 0;
const sexIndex = 1;
const mediiRezidentaIndex = 2;
const regiuniIndex = 3;
const aniIndex = 4;
const umIndex = 5;
const valIndex = 6;

const acceptedMediiRezidenta = [ "Total" ];
const acceptedMacroregiuni = [ "TOTAL" ];

let errors = null;
let rowErrors = null;

const validateHeader = (data) =>{
    return JSON.stringify(HEADER) === JSON.stringify(data);
};

const validateAndReturnAgeRow = (row, ageIndex) => {
    let group = row[ageIndex].trim();
    let greaterThan = "> ";
    let andAbove = "si peste";
    if (insseAgeCategories.includes(group)){
        group = group.replace("ani", "").trim();
        if(group.includes(andAbove)){
            return greaterThan.concat(group
                            .replace(andAbove, "")
                            .trim()
                        );
        }
        return group;
    }
    // not the right input filed
    rowErrors.push("UnexpectedAgeGroup: Caracter neasteptat la citirea grupului de varsta in randul '" + row + "'.");
    return false;
};

const validateAndReturnSexRow = (row, sexIndex) => {
    if (insseSexCategories.includes(row[sexIndex].trim())){
        return row[sexIndex].trim();
    }
    // not the right input filed
    rowErrors.push("UnexpectedSexType: Tipul de sex asteptat '" + insseSexCategories[0] + "' sau '" + insseSexCategories[1] + "' negasit in '" + row + "'.");
    return false;
};

const validateMediiRow = (row, mediiIndex) => {
    return insseMediiRezidenta.includes(row[mediiIndex].trim()) && acceptedMediiRezidenta.includes(row[mediiIndex].trim());
};

const validateRegiuni = (row, regiuniIndex) => {
    return insseMacroregiuni.includes(row[regiuniIndex].trim()) && acceptedMacroregiuni.includes(row[regiuniIndex].trim());
};

const validateAndReturnAni = (row, aniIndex) => {
    if (row[aniIndex].trim().substring(0, 5) === insseAni){
        return validateAndReturnInt(row[aniIndex].trim().substring(5).trim(), 0);
    }
    // not the right input filed
    rowErrors.push("UnexpectedAniType: Tipul de an asteptat '" + insseAni + "' negasit in '" + row + "'.");
    return false;
};

const validateUM = (row, umIndex) => {
    return insseUM.includes(row[umIndex].trim());
};

const validateAndReturnInt = (row, valIndex) => {
    let val = parseInt(row[valIndex]);
    if ( val !== "NaN" && val >= 0){
        return val;
    }
    // value wasn't parsed correctly or was < 0
    rowErrors.push("UnexpectedInteger: Caracter neasteptat la citire in randul '" + row + "'.");
    return false;
};

const validateAndGetRow = (row) => {
    if (validateAndReturnInt(row, 0) === false){
        // First row doesn't start with
        rowErrors.push("Prima coloana din randul '" + row + "' nu incepe cu un numar intreg.");
        return false;
    }
    let ageG = validateAndReturnAgeRow(row, ageIndex);
    let sexT = validateAndReturnSexRow(row, sexIndex);
    let ani = validateAndReturnAni(row, aniIndex);
    let val = validateAndReturnInt(row, valIndex);
    if (!validateMediiRow(row, mediiRezidentaIndex)
    || !validateRegiuni(row, regiuniIndex)
    || !validateUM(row, umIndex)
    || ageG === false || sexT === false
    || ani === false || val === false){
        // ToDo: Handle errors 
        // validation error array
        return false;
    };
    return {
        ageGroup: ageG,
        sex: sexT,
        an: ani,
        valoare: val
    };
};

exports.parseData = (inputData) => {
    let errorsCount = 0;
    let MAX_ERRORS = 15;
    errors = [];
    const yearList = [];
    const result = [];
    const text = inputData.result;
    let firstRow = text[0];
    if (!validateHeader(firstRow)) {
        errors.push("Fisierul " + data.path + " nu are formatul corespunzator.");
        return { value: { years: yearList , data: result } , errorMessages: errors };
    }
    for (var i = 1; i < text.length - 1; i++){
        rowErrors = [];
        let currentRow = text[i];

        if (currentRow.length != HEADER.length){
            continue;
        }
        let rowObj = validateAndGetRow(currentRow);
        if (rowObj === false){
            errors.push(rowErrors);
            errorsCount++;
            // Too many errors
            if (errorsCount === MAX_ERRORS){
                return { value: { years: yearList , data: result } , errorMessages: errors };
            }
            continue;
        }
        let categorie = rowObj.an;
        let index;

        if (!yearList.includes(categorie)){
            yearList.push(categorie);
            result.push([]);
        }

        const element = { 
            ageGroup: rowObj.ageGroup, 
            sex: rowObj.sex, 
            value: rowObj.valoare
        };
        if (rowErrors.length !== 0){
            errors.push({ row: i+1, log: rowErrors });
        }

        rowErrors = null;
        index = yearList.indexOf(categorie);
        result[index].push(element);
    }
    const resultData = [];
    for (var year = 0; year < result.length; year++){
        let partial = [];
        for (var index = 0; index < result[year].length - 1; index++){
            if (result[year][index].ageGroup === result[year][index+1].ageGroup ) { 
                if (result[year][index].sex === insseSexCategories[0] && result[year][index+1].sex === insseSexCategories[1] ){
                    partial.push({ age:result[year][index].ageGroup, male: result[year][index].value, female: result[year][index+1].value });
                }
                if(result[year][index].sex === insseSexCategories[1] && result[year][index+1].sex === insseSexCategories[0]) {
                    partial.push({ age:result[year][index].ageGroup, male: result[year][index+1].value, female: result[year][index].value });
                }
            }
        }
        resultData.push(partial);
    }
    errors = null;

    // Return object as in example
    return { value: { years: yearList , data: resultData } , errorMessages: errors };
};