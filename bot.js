const fetch = require("node-fetch");
var Discord = require('discord.io');
var Request = require('request');
var logger = require('winston');
var auth = require('./auth.json');
var util = require('util');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const url = 'https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php';
const APIKey = "b7738beb69msh75347bc8e4a3c83p1ac40ejsncdce7856c215";


//CONFIGURE logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';
//INITIALIZE DISCORD BOT
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
    //Our bot needs to know if it will execute a command
    //It will listen for messages that will start with '!'
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch (cmd) {
            case 'covid-help':
                bot.sendMessage({
                    to: channelID,
                    message: 'Hello! I am **COVID-BotMan!** A discord bot made by Geneonosis that will monitor the outside world for you and report information on the **COVID-19** Pandemic!\n**Commands:** \n`!covid-help` :: displays this help menu \n`!covid-report` :: gives a report on the status of the virus \n`!covid-news` :: provides the latest headlines and news on the outbreak\n`!covid-repo` :: learn more about my code! \n \n Stay safe! <3'
                });
                break;
            case 'covid-report':
                covidReport(bot);
                break;
            case 'covid-news':
                covidNews(bot);
                break;
            case 'covid-repo':
                bot.sendMessage({
                    to: channelID,
                    message: 'Learn more about me! here\'s a link to my code!\n https://github.com/Geneonosis/COVID19-BotMan'
                })
            default:
                break;
            //Just add any case commands if you want to ...
        }
    }

    //function to control the covid news swithc case
    function covidNews(bot) {
        const Http = new XMLHttpRequest();
        var jsonText = "";
        Http.open("GET", "http://newsapi.org/v2/top-headlines?country=us&q=coronavirus&apiKey=0ab861f5771141e890b50e91989f72db");
        //Http.setRequestHeader("X-RapidAPI-Key",APIKey)
        Http.send();
        Http.onreadystatechange = function () {
            jsonText = Http.responseText;
            if (this.readyState == 4 && this.status == 200) {
                try {
                    var data = JSON.parse(jsonText);
                    var dateObj = new Date();
                    var header = "here is the latest news on the coronavirus (COVID-19) as of: " + dateObj.toString() + "\n";
                    var title = '**' + Object.values(data)[2][0]["title"] + '**' + '\n';
                    var link = Object.values(data)[2][0]["url"];
                    var string = header + title + link + '\n' + "powered by NewsAPI";
                    bot.sendMessage({
                        to: channelID,
                        message: string
                    });
                } catch (err) {
                    Console.error(err);
                }
            }
        }
    }

    //function to control the covid report switch case
    function covidReport(bot) {
        var casesCount = 0;
        var deathsCount = 0;
        var recoveryCount = 0;
        var countriesCount = 0;
        var jsonText = '';
        const Http = new XMLHttpRequest();
        Http.open("GET", url);
        Http.setRequestHeader("X-RapidAPI-Key", APIKey)
        Http.send();
        Http.onreadystatechange = function () {
            jsonText = Http.responseText;
            if (this.readyState == 4 && this.status == 200) {
                try {
                    var data = JSON.parse(jsonText);
                    var dateObj = new Date();
                    var header = 'Below is a list of the top 10 countries with the COVID-19 as of: ' +
                        dateObj.toString() +
                        '\n' +
                        '```Country:                 Cases:  Deaths: Recovered:\n' +
                        '------------------------------------------------\n';
                    //for(var i = 0; i < Object.values(data)[0][0].length
                    console.log(Object.values(data)[0].length);
                    var string = header;
                    for (var i = 0; i < Object.values(data)[0].length; i = i + 1) {
                        var dict = Object.values(data)[0][i];
                        countriesCount = Object.values(data)[0].length;
                        casesCount += parseInt(dict["cases"].replace(",", ""));
                        deathsCount += parseInt(dict["deaths"].replace(",", ""));
                        recoveryCount += parseInt(dict["total_recovered"].replace(",", ""));
                    }

                    Object.values(data)[0].sort((countryA, countryB) => {
                        return countryB["cases"] - countryA["cases"];
                    })

                    for (var i = 0; i < 10; i = i + 1) {
                        var dict = Object.values(data)[0][i]
                        var country = dict["country_name"];
                        var cases = dict["cases"];
                        var deaths = dict["deaths"];
                        var recovered = dict["total_recovered"];
                        while (country.length < 20) {
                            country += ' ';
                        }
                        while (cases.length < 7) {
                            cases += ' ';
                        }
                        while (deaths.length < 7) {
                            deaths += ' ';
                        }
                        while (recovered.length < 7) {
                            recovered += ' ';
                        }
                        indexString = (i + 1).toString();
                        indexString += '.';
                        while (indexString.length < 3) {
                            indexString += ' ';
                        }
                        var row = util.format("%s %s %s %s %s\n", indexString, country, cases, deaths, recovered);
                        string += row;
                    }
                    stringCCount = countriesCount.toString();
                    stringCaCount = casesCount.toString();
                    stringDCount = deathsCount.toString();
                    stringRCount = recoveryCount.toString();
                    while (stringCCount.length < 20) {
                        stringCCount += ' ';
                    }
                    while (stringCaCount.length < 7) {
                        stringCaCount += ' ';
                    }
                    while (stringDCount.length < 7) {
                        stringDCount += ' ';
                    }
                    while (stringRCount.length < 7) {
                        stringRCount += ' ';
                    }
                    var totalCounts = util.format("%s %s %s %s\n", stringCCount, stringCaCount, stringDCount, stringRCount)
                    footer = '------------------------------------------------\n' +
                        'TOTALS\n' +
                        'Countries:           Cases:  Deaths: Recovered:\n' +
                        totalCounts +
                        '------------------------------------------------\n```';
                    string += footer;
                    bot.sendMessage({
                        to: channelID,
                        message: string
                    });
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }
});