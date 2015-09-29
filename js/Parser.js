/**
 * @author narmiel
 */

/**
 * @constructor
 */
function Parser() {

    /**
     *
     * @param line
     */
    this.parse = function(line) {
        line = line.trim();
        // просмотреть список известных операторов
        var expl = line.split(' ');
        var operand = expl[0].toLowerCase().trim();
        var command = expl.slice(1).join(' ').trim();

        if (operand == 'if') {
            var cond = line.substring(line.indexOf('if ') + 3, line.indexOf(' then '));

            var then;
            var els;
            if (line.indexOf(' else ') == -1) {
                then = line.substring(line.indexOf(' then ') + 6);
                els = false;
            } else {
                then = line.substring(line.indexOf(' then ') + 6, line.indexOf(' else '));
                els = line.substring(line.indexOf(' else ') + 6);
            }

            if (new Expression(this.openTags(cond)).calc()) {
                this.parse(then);
            } else {
                if (els) {
                    this.parse(els);
                }
            }
        } else {
            //todo
            line = this.prepareLine(line);
            expl = line.split(' ');
            operand = expl[0].toLowerCase().trim();
            command = expl.slice(1).join(' ').trim();

            switch (operand) {
                case 'forget_proc': return GlobalPlayer.forgetProc();
                case 'proc': return GlobalPlayer.proc(command);
                case 'end': return GlobalPlayer.end();
                case 'anykey': return GlobalPlayer.anykey(command);
                case 'pause': return GlobalPlayer.pause(parseInt(command));
                case 'input': return GlobalPlayer.input(command);
                case 'quit': return GlobalPlayer.quit();
                case 'invkill': return GlobalPlayer.invkill(command.length >0 ? command : null);
                case 'perkill': return GlobalPlayer.perkill();
                case 'inv-':
                    var item = command.split(',');
                    var quantity = 1;
                    if (item.length > 1) {
                        quantity = parseInt(item[0]);
                        item = item[1];
                    }

                    return GlobalPlayer.invRemove(item.toString().trim(), quantity);
                case 'inv+':
                    item = command.split(',');
                    quantity = 1;
                    if (item.length > 1) {
                        quantity = parseInt(item[0]);
                        item = item[1];
                    }

                    return GlobalPlayer.invAdd(item.toString().trim(), quantity);
                case 'goto': return GlobalPlayer.goto(command);
                case 'p':
                case 'print': return GlobalPlayer.print(command, false);
                case 'pln':
                case 'println': return GlobalPlayer.print(command, true);
                case 'btn':
                    var btn = command.split(',');

                    return GlobalPlayer.btn(btn[0].trim(), btn.slice(1).join(',').trim());
                //рудименты далее
                case 'instr':
                    line = command;
                    // no break here
                default:
                    //  это выражение?
                    if (line.indexOf('=') > 0) {
                        var variable = line.substring(0, line.indexOf('='));
                        var value = new Expression(line.substr(line.indexOf('=') + 1)).calc();
                        Game.setVar(variable, value);
                    } else {
                        console.log('Unknown operand: ' + operand + ' ignored (line: ' + line + ')');
                    }
            }
        }

    };

    /**
     * Разбиваем по &
     *
     * @param line
     *
     * @returns {String}
     */
    this.prepareLine = function (line) {
        if (line.indexOf('&') != -1) {
            GlobalPlayer.flowAdd(line.substring(line.indexOf('&') + 1).trim());
            line = line.substring(0, line.indexOf('&')).trim();
        }

        return this.openTags(line);
    };

    /**
     * Открываем #$, #%$
     *
     * @param {String} line
     *
     * @returns {String}
     */
    this.openTags = function (line) {
        // открыть #$
        while (line.indexOf('#') != -1 && line.indexOf('$') != -1) {
            var exp = line.substring(line.lastIndexOf('#') + 1, line.indexOf('$'));

            // рудимент для совместимости
            if (exp[0] == '%') {
                exp = exp.substr(1);
            }

            line = line.slice(0, line.lastIndexOf('#')) + new Expression(exp).calc() + line.slice(line.indexOf('$') + 1);
        }

        return line;
    };
}

