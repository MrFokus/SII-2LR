const express = require('express')
const fs = require('fs')
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express()
const port = 3001

app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
    console.log('dfbdsfb')
    let object = fileRead('rules.txt')
    res.json(fileRead('rules.txt'))

})

app.post('/',(req,res)=>{
    res.json(Processing(req.body))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

function fileRead(file) {
    let arr_strs = fs.readFileSync(file, "utf8").split('\n');
    arr_strs = arr_strs.filter(str => str.trim())
    let obj = arr_strs.map(str => transformStroke(str))
    obj = deleteDuplicates(obj)
    return obj
}

function transformStroke(str) {
    let str_copy = str
    let obj
    if (str_copy.length > 4) {
        obj = {
            name: '',
            states: [],
        }
        obj.name = str_copy.slice(str_copy.indexOf('ТО '), str_copy.indexOf('=', str_copy.indexOf('ТО '))).replace("ТО ", '').trim()
        obj.states.push(
            {
                result: str_copy.slice(str_copy.indexOf('=', str_copy.indexOf('ТО ')) + 1).trim(),
                current_state: str_copy.slice(str_copy.indexOf('=', str_copy.indexOf('ТО ')) + 1).trim().includes('не ') ? str_copy.slice(str_copy.indexOf('=', str_copy.indexOf('ТО ')) + 1).trim() : "не " + str_copy.slice(str_copy.indexOf('=', str_copy.indexOf('ТО ')) + 1).trim(),
                action: []
            }
        )
        for (let i = 4; i < str_copy.indexOf('ТО '); i++) {
            if (str_copy.indexOf('=', i) !== -1) {
                obj.states[0].action.push(
                    {
                        name: str_copy.slice(i, str_copy.indexOf('=', i)).replace("ТО ", '').replace('И ', '').trim(),
                        state: str_copy.slice(str_copy.indexOf('=', i) + 1, checkToAnd(i)).trim()

                    })
                i = checkToAnd(i)
            }
        }
    }

    function checkToAnd(i) {
        if (str_copy.indexOf(' И ', i) !== -1) {
            return str_copy.indexOf(' И ', i)
        } else if (str_copy.indexOf(' ТО ', i) !== -1) {
            return str_copy.indexOf(' ТО ', i)
        } else {
            return str_copy.length
        }
    }

    return obj
}

function setIndexAction(obj) {
    for (let i = 0; i < obj.length; i++) {
        for (let j = 0; j < obj[i].states.length; j++) {
            for (let k = 0; k < obj[i].states[j].action.length; k++) {
                obj[i].states[j].action[k].index = obj.findIndex(o => o.name === obj[i].states[j].action[k].name)
            }
        }
    }
    return obj
}

function deleteDuplicates(obj) {
    let newObjs = []
    obj.forEach((object, index) => {
        if (newObjs.some(el => el?.name === object?.name)) {
            newObjs.forEach(ob => {
                if (ob.name === object.name) {
                    ob.states.push(obj[index].states[0])
                }
            })
        } else {
            newObjs.push(object)
        }
    })
    newObjs = setIndexAction(newObjs)
    return newObjs
}

function checkActions(obj, indexes) {
    for (let i = 0; i < indexes.length; i++) {
        if (obj[indexes[i].index].states.findIndex(el => el.current_state === indexes[i].state) === -1) {
            return false
        }
    }
    return true
}

function checkResult(obj){
    for (let i = 0; i < obj.length; i++) {
        for (let j = 0; j < obj[i].states.length; j++) {
            if(obj[i].states[j].result!==obj[i].states[j].current_state){
                return false
            }
        }
    }
    return true
}

function Processing(obj) {
    let res = []
    while(!checkResult(obj)) {
        for (let i = 0; i < obj.length; i++) {
            for (let j = 0; j < obj[i].states.length; j++) {
                if (obj[i].states[j].current_state !== obj[i].states[j].result) {
                    if (checkActions(obj, obj[i].states[j].action)) {
                        obj[i].states[j].current_state = obj[i].states[j].result
                        res.push(`${obj[i].name}: ${obj[i].states[j].result}`)
                    }
                }
            }
        }
        console.log('---------------------------------------------------')
    }
    console.dir(obj)
    return res
}