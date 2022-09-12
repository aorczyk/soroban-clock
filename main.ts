let hours = 8;
let minutes = 58;
let seconds = 0;
let mode = 0;
let clockMode = 0;
let settingsMode = 0;

let alarmHours = 12;
let alarmMinutes = 15;
let alarmStatus = false;
let alarmOn = false;
let alarmStartTime = 0;
let screenStatus = true;

showTime(hours, minutes)

input.onLogoEvent(TouchButtonEvent.Pressed, function() {
    if (clockMode == 0){
        screenStatus = !screenStatus
    }

    if (!screenStatus){
        basic.clearScreen()
    } else {
        showTime(hours, minutes)
    }
})

input.onButtonPressed(Button.AB, function () {
    clockMode++
    if (clockMode > 2) {
        clockMode = 0
    }

    if (clockMode == 1){
        settingsMode = 0;
        basic.showString("T")
        basic.clearScreen()
        showTime(hours, minutes)
    } else if (clockMode == 2) {
        settingsMode = 0;
        basic.showString("A")
        basic.clearScreen()
        showTime(alarmHours, alarmMinutes)
    } else {
        basic.showString("C")
        basic.clearScreen()
        showTime(hours, minutes)
    }
})

input.onButtonPressed(Button.A, function() {
    if (clockMode == 0){
        mode++

        basic.clearScreen()
        if (mode == 1) {
            soroban.showNumber(seconds)
        } else if (mode == 0){
            screenStatus = true
            showTime(hours, minutes)
        } else if (mode == 2) {
            showTime(alarmHours, alarmMinutes)
            if (alarmStatus){
                led.plot(2,4)
            }
        } else {
            mode = 0
            showTime(hours, minutes)
        }
    } else if (clockMode == 1 || clockMode == 2){
        settingsMode++
        if (settingsMode > 2) {
            settingsMode = 0
        }

        if (settingsMode == 1) {
            basic.showString("H")
            basic.clearScreen()
            soroban.showNumber(clockMode == 1 ? hours : alarmHours, Align.C2, true)
        } else if (settingsMode == 2) {
            basic.showString("M")
            basic.clearScreen()
            soroban.showNumber(clockMode == 1 ? minutes : alarmMinutes, Align.C5, false)
        } else if (settingsMode == 0) {
            basic.showIcon(IconNames.Yes)
            basic.clearScreen()
            showTime(hours, minutes)
            clockMode = 0
        }
    }
})

input.onButtonPressed(Button.B, function () {
    if (alarmOn) {
        alarmOn = false
        basic.showIcon(IconNames.Asleep)
        basic.pause(1000)
        showTime(hours, minutes)
        return
    }

    if (clockMode == 1) {
        if (settingsMode == 1) {
            hours += 1
            if (hours > 23) {
                hours = 0;
            }
            soroban.showNumber(hours, Align.C2, true)
        } else if (settingsMode == 2) {
            minutes += 1
            if (minutes > 59) {
                minutes = 0;
            }
            seconds = 0
            soroban.showNumber(minutes, Align.C5, false)
        }
    } else if (clockMode == 2){
        if (settingsMode == 1) {
            alarmHours += 1
            if (alarmHours > 23) {
                alarmHours = 0;
            }
        } else if (settingsMode == 2) {
            alarmMinutes += 1
            if (alarmMinutes > 59) {
                alarmMinutes = 0;
            }
        }

        showTime(alarmHours, alarmMinutes)
    } else if (clockMode == 0){
        alarmStatus = !alarmStatus

        if (alarmStatus) {
            led.plot(2, 4)
        } else {
            led.unplot(2, 4)
        }
    }
})

function fixTime(){
    if (seconds > 59) {
        seconds = 0;
        minutes += 1;
    }

    if (minutes > 59) {
        minutes = 0;
        hours += 1;
    }

    if (hours > 23) {
        hours = 0;
    }
}

function showTime(hours: number, minutes: number){
    soroban.showNumber(hours, Align.C2, true)
    soroban.showNumber(minutes, Align.C5, false)

    if (alarmStatus) {
        led.plot(2, 4)
    }
}

basic.forever(function() {
    seconds += 1;
    fixTime()

    if (clockMode == 0 && screenStatus){
        if (mode == 0) {
            if (seconds == 0){
                showTime(hours, minutes)
            }

            if (seconds % 2) {
                led.plot(2, 2)
            } else {
                led.unplot(2, 2)
            }
        } else if (mode == 1) {
            soroban.showNumber(seconds)
        }
    }



    if (alarmStatus && alarmHours == hours && alarmMinutes == minutes && seconds == 0){
        alarmOn = true
        screenStatus = true
        alarmStartTime = input.runningTime()
    }

    basic.pause(1000)
})

basic.forever(function () {
    if (alarmOn){
        // music.playTone(Note.C, music.beat())
        music.playSoundEffect(music.createSoundEffect(WaveShape.Sine, 5000, 0, 120, 0, 500, SoundExpressionEffect.None, InterpolationCurve.Linear), SoundExpressionPlayMode.UntilDone)
        basic.pause(1000)

        if (input.runningTime() - alarmStartTime > 30 * 1000){
            alarmOn = false
        }
    }
})