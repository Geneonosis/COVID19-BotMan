const fetch = require("node-fetch");
var Discord = require('discord.io');
var Request = require('request');
var logger = require('winston');
var auth = require('./auth.json');
var botInfo = require('./package.json');
var util = require('util');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var covidAPI = require('covid19-api');

const url = 'https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php';
const APIKey = "b7738beb69msh75347bc8e4a3c83p1ac40ejsncdce7856c215";
const map = 'https://www.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6';

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

helperMessage = 'Hello! I am **COVID-BotMan!** Version: ' + botInfo.version + ' A Discord bot made by Geneonosis that will monitor the outside world for you and report information on the **COVID-19** Pandemic!\n' 
              + 'Type any of the following commands into the server that I am apart of and you will be presented with statistics and information on the coronavirus!\n ' 
              + '**Commands:** \n`!covid-help` :: displays this help menu \n' 
              + '`!covid-report` :: sends you a coronavirs report to the server \n'
              + '`!covid-report-dm` :: sends a report directly to you DMs instead of to the server \n'
              + '`!covid-news` :: provides your dms with the latest headlines and news on the outbreak\n'
              + '`!covid-repo` :: learn more about my code! \n '
              + '`!covid-map`  :: link to map - work in progress \n\n Stay safe! <3'
                 

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
                    to: userID,
                    message: helperMessage
                });
                break;
            case 'covid-report-dm':
                covidReport(bot,userID);
                break;
            case 'covid-report':
		        covidReport(bot,channelID);
                break;
            case 'covid-news':
                covidNews(bot);
                break;
            case 'covid-map':
                bot.sendMessage({
                    to: userID,
                    message: map
                })
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
                        to: userID,
                        message: string
                    });
                } catch (err) {
                    Console.error(err);
                }
            }
        }
    }

    function covidReport(bot,sendhere) {

        var jsonText = '';
        const Http = new XMLHttpRequest();

        Http.open("GET", "https://covid19api.io/api/v1/AllReports");

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
                        '```Country:      Cases:    Deaths: Recovered:\n' +
                        '------------------------------------------------\n';

                    var newData = data.reports;
                    cases = newData[0]["table"][0].sort((countryA, countryB) => {
                        return parseInt(countryB["TotalCases"].replace(/,/g,"")) - parseInt(countryA["TotalCases"].replace(/,/g,""));
                    })

                    totalCases = newData[0]["cases"]
                    totalDeaths = newData[0]["deaths"]
                    totalRecoveries = newData[0]["recovered"]

                    var totals = "total cases: " + totalCases + "\ndeaths: " + totalDeaths + "\nrecovered: " + totalRecoveries + "\n";

                    string = ""
                    string += header
                    for(var i = 1; i < 12; i = i + 1){

                        //INDEX
                        c_index = ""
                        c_index += i-1 + "."
                        while (c_index.length < 4){
                            c_index += ' ';
                        }

                        //COUNTRY
                        c_country = cases[i]["Country"];
                        while (c_country.length < 10){
                            c_country += ' ';
                        }

                        //CASES
                        c_cases = cases[i]["TotalCases"];
                        while (c_cases.length < 10) {
                            c_cases += ' ';
                        }

                        //DEATHS
                        c_deaths = cases[i]["TotalDeaths"];
                        while(c_deaths.length < 8) {
                            c_deaths += ' ';
                        }

                        //RECOVERED
                        c_recoveries = cases[i]["TotalRecovered"];
                        while(c_recoveries.length < 8) {
                            c_recoveries += ' ';
                        }
                        string += c_index + c_country + c_cases + c_deaths + c_recoveries + "\n";
                    }


                    string += "```"
                    bot.sendMessage({
                        to: sendhere,
                        message: string
                    });
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }
});
