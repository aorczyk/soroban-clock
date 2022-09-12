let hours = 21;
let minutes = 37;
let seconds = 0;
let mode = 0;
let clockMode = 0;
let settingsMode = 0;

let alarmHours = 5;
let alarmMinutes = 30;
let alarmStatus = false;
let alarmOn = false;
let alarmStartTime = 0;
let screenStatus = true;

showClock()


let clockModeBefore = 0;
let settingsModeBefore = 0;

function modeGuard(){
    if (mode > 3) {
        mode = 0
    }

    if (clockMode > 2) {
        clockMode = 0
    }

    if (settingsMode > 2 || clockModeBefore != clockMode) {
        settingsMode = 0
    }

    clockModeBefore = clockMode;
    settingsModeBefore = settingsMode;
}

input.onLogoEvent(TouchButtonEvent.Pressed, function() {
    if (clockMode == 0){
        screenStatus = !screenStatus
    }

    if (!screenStatus){
        basic.clearScreen()
    } else {
        showClock()
    }
})

input.onButtonPressed(Button.AB, function () {
    clockMode++
    modeGuard()

    if (clockMode == 1){
        settingsMode = 0;
        basic.showString("T")
        basic.clearScreen()
        showClock()
    } else if (clockMode == 2) {
        settingsMode = 0;
        basic.showString("A")
        basic.clearScreen()
        showTime(alarmHours, alarmMinutes)
    } else if (clockMode == 3) {
        basic.clearScreen()
    } else {
        showClock()
    }
})

input.onButtonPressed(Button.A, function() {
    if (clockMode == 0){
        mode++
        modeGuard()

        basic.clearScreen()
        if (mode == 0) {
            screenStatus = true
            showClock()
        } else if (mode == 1) {
            soroban.showNumber(seconds)
        } else if (mode == 2) {
            showTime(alarmHours, alarmMinutes)
        } else {
            basic.clearScreen()
        }
    } else if (clockMode == 1 || clockMode == 2){
        settingsMode++
        modeGuard()

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
            showClock()
            clockMode = 0
        }
    }
})

input.onButtonPressed(Button.B, function () {
    if (alarmOn) {
        alarmOn = false
        basic.showIcon(IconNames.Yes)
        basic.pause(1000)
        showClock()
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

function showClock(){
    showTime(hours, minutes)

    if (seconds % 2) {
        led.plot(2, 2)
    } else {
        led.unplot(2, 2)
    }
}

basic.forever(function() {
    seconds += 1;
    fixTime()

    control.inBackground(function() {
        if (clockMode == 0 && screenStatus) {
            if (mode == 0) {
                showClock()
            } else if (mode == 1) {
                soroban.showNumber(seconds)
            }
        }

        if (alarmStatus && alarmHours == hours && alarmMinutes == minutes && seconds == 0) {
            alarmOn = true
            screenStatus = true
            alarmStartTime = input.runningTime()
        }
    })

    basic.pause(1000)
})

basic.forever(function () {
    if (alarmOn){
        // music.playTone(Note.C, music.beat())
        music.playSoundEffect(music.createSoundEffect(WaveShape.Sine, 5000, 0, 120, 0, 500, SoundExpressionEffect.None, InterpolationCurve.Linear), SoundExpressionPlayMode.UntilDone)
        led.unplot(2, 4)
        basic.pause(1000)
        led.plot(2, 4)

        if (input.runningTime() - alarmStartTime > 30 * 1000){
            alarmOn = false
        }
    }
})