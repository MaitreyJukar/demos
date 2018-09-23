var pay = function mandavli(chutta1, chutta2, bill) {
    var paymentData = {
            tip: 0
        },
        splitwise = {},
        badaChutta = Math.max(chutta1, chutta2),
        chotaChutta = Math.min(chutta1, chutta2),
        chutta = [badaChutta, chotaChutta],
        currency = '-ka-patti',
        sabseChotaTip = bill,
        bachaPaisa,
        ekChutta,
        dusraChutta,
        abKyaBacha,
    i;

    paymentData[chutta1] = 0;
    paymentData[chutta2] = 0;

    for (i = 0; i < chutta.length; i++) {
        ekChutta = chutta[i];
        if (!(bill % ekChutta)) {
            paymentData[ekChutta + currency] = bill / ekChutta;
            return paymentData;
        }
    }

    for (i = 0; i < chutta.length; i++) {
        ekChutta = chutta[i];
        dusraChutta = chutta[(i + 1) % 2];
        bachaPaisa = bill % dusraChutta;
        while (bachaPaisa < bill) {
            abKyaBacha = bachaPaisa % ekChutta;
            if (!abKyaBacha) {
                paymentData[ekChutta + currency] = bachaPaisa / ekChutta;
                paymentData[dusraChutta + currency] = (bill - bachaPaisa) / dusraChutta;
                return paymentData;
            }
            if (abKyaBacha < sabseChotaTip) {
            	sabseChotaTip = abKyaBacha;
                splitwise[ekChutta + currency] = (bachaPaisa - abKyaBacha) / ekChutta;
                splitwise[dusraChutta + currency] = (bill - bachaPaisa) / dusraChutta;
                splitwise.tip = abKyaBacha;
            }
            bachaPaisa += dusraChutta;
        }
    }

    return splitwise;
}
