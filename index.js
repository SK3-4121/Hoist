// Hoist
// index.js
// Made by Max on 6/2/2022 at 10:19

const fs = require("fs")
const express = require('express')
const router = express.Router();
const createError = require('http-errors')
const path = require("path")
const { exit } = require("process")
const app = express()
const port = 24080

console.log('[+]: Thank you for using Hoist! Hope you enjoy it.')

app.use(express.urlencoded({ extended: true }))

function randomString(length) {
    var result = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

function MirrorFiles() {
    console.log("[/]: Setting up /host/ directory")
    try {
        var hostFolder = __dirname + "/host/"
        // var mirrorFolder = __dirname + "/site/web/mirror/" 
        exports.hostFolder = hostFolder
        // exports.mirrorFolder = mirrorFolder

        if (fs.existsSync(hostFolder)) {
            console.log("[+]: Successfuly setting up /host/ directory")
            exports.hostFolderExist = true
        } else {
            console.log("[-]: Failed setting up /host/ directory [because folder don't exist]")
            exports.hostFolderExist = false
            exit(1)
        }

        var hostvideosFolder = hostFolder + "videos/"
        if (fs.existsSync(hostvideosFolder)) {
            fs.readdir(hostvideosFolder, (err, files) => {
                files.forEach(file => {
                    const encodedUrl = encodeURI(file);
                    app.get(`/${encodedUrl}`, (req, res) => {
                        res.sendFile(file, {root: hostvideosFolder})
                    })
                })
            })
        }
    } catch {
        console.log("[-]: Failed setting up /host/ directory [this is like the worst possible error you can get while getting mirrors]")
        exit(1)
    }
}

MirrorFiles()

app.use(express.static(__dirname + '/site'))

app.get('/', (req, res) => {
    res.redirect("/home")
})

app.get("/home", (req, res) => {
    var page = __dirname + "/site/web/index.html"
    var pagesource = fs.readFileSync(page)
    let externalscript = `\n<script>
    const con = document.getElementById("video-container");\n`

    var hostvideosFolder = __dirname + "/host/videos/"
    if (fs.existsSync(hostvideosFolder)) {
        fs.readdir(hostvideosFolder, (err, files) => {
            files.forEach(file => {
                const ButtonRandomName = randomString(24)
                externalscript = `${externalscript}\n
                const ${ButtonRandomName} = document.createElement('button')
                ${ButtonRandomName}.innerText = '${file}'
                ${ButtonRandomName}.id = '${file}-Button'
                
                ${ButtonRandomName}.addEventListener("click", function() {
                    window.location.href = "${file}";
                })
                
                con.appendChild(${ButtonRandomName})`
            })
            
            // console.log(externalscript + "</script>")
            res.send(pagesource + externalscript + "\n</script>")
        })
    }
})

app.get("/refresh/", (req, res) => {
    res.send("[+]: Successfuly refreshed the mirror host!")
    console.log("[+]: Successfuly refreshed the mirror host!")
    MirrorFiles()
})

app.listen(port, () => {
  console.log('[+]: Started server')
})
