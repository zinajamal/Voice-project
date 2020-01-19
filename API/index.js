const express = require('express');
const body_parser = require('body-parser');
const app = express();
const port = 3002;
app.use(body_parser.json());
app.listen(port, function() {
    console.log('Hypotheek API is aan!');
})

app.post('/calculate', (req,res) => {

    const yearIncome = getAmountFromInput(req.body.yearIncome);
    const studyDebt = getAmountFromInput(req.body.studyDebt);
    const alimony = getAmountFromInput(req.body.alimony);
    const otherLoans = getAmountFromInput(req.body.otherLoans);
    const isTogether = getTogetherOrAlone(req.body.togetherOrAlone);

    let amountForLoan = yearIncome - studyDebt - alimony - otherLoans;
    if (isTogether) {
        amountForLoan = amountForLoan * 2;
    }

    res.send(amountForLoan + "");
})

function getAmountFromInput(input) {
    return input.split(" euro")[0];
}

function getTogetherOrAlone(togetherOrAlone) {
    if (togetherOrAlone.toUpperCase() == "SAMEN") return true;
    else return false;
}