function dispararBrilho() {
    confetti({
        particleCount: 100, // Quantidade de purpurina
        spread: 70,         // O quão longe ela voa
        origin: { y: 0.6 }, // De onde ela sai (0.6 é perto do meio)
        colors: ['#F5617A', '#FFD700', '#FFFFFF'], // Rosa, Dourado e Branco
        shapes: ['circle'], // Para parecer purpurina redondinha
        scalar: 0.7         // Tamanho das partículas
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const btnStart = document.getElementById('btn-start');
    const screenStart = document.getElementById('screen-start');
    const screenGame = document.getElementById('screen-game');
    const screenError = document.getElementById('screen-error');
    const screenSurprise = document.getElementById('screen-surprise');
    
    const stepShoes = document.getElementById('step-shoes');
    const stepClothes = document.getElementById('step-clothes');
    const stepMakeup = document.getElementById('step-makeup');
    const stepHair = document.getElementById('step-hair');
    const shoeOptions = document.querySelectorAll('.shoe-option');
    const clothesOptions = document.querySelectorAll('.clothes-option');
    const makeupOptions = document.querySelectorAll('.makeup-option');
    const hairOptions = document.querySelectorAll('.hair-option');
    const stepGenerate = document.getElementById('step-generate');
    const btnGenerate = document.getElementById('btn-generate');
    const btnFallback = document.getElementById('btn-fallback');
    
    const popupGostou = document.getElementById('popup-gostou');
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    let fleeCount = 0;

    const errorMsgs = [
        document.getElementById('error-msg-1'),
        document.getElementById('error-msg-2'),
        document.getElementById('error-msg-3'),
        document.getElementById('error-msg-4'),
        document.getElementById('error-msg-5')
    ];
    const surpriseMusic = document.getElementById('surprise-music');

    // Função que inicia a sequência final de erro e surpresa
    function startFinalSequence() {
        screenGame.classList.add('hidden');
        screenError.classList.remove('hidden');
        
        // Sequência de mensagens de erro no terminal
        setTimeout(() => errorMsgs[0].classList.remove('hidden'), 500);
        setTimeout(() => errorMsgs[1].classList.remove('hidden'), 2500);
        setTimeout(() => errorMsgs[2].classList.remove('hidden'), 3500);
        setTimeout(() => errorMsgs[3].classList.remove('hidden'), 5500);
        setTimeout(() => errorMsgs[4].classList.remove('hidden'), 7500);
        
        // Finaliza o erro e mostra a tela surpresa com música
        setTimeout(() => {
            screenError.classList.add('hidden');
            screenSurprise.classList.remove('hidden');
            dispararBrilho();
            setTimeout(dispararBrilho, 500); // Dispara duas vezes pra ficar bem festivo
            surpriseMusic.currentTime = 116; // Inicia a música em 1:56 (116 segundos)
            surpriseMusic.play();
            
            // 8 segundos depois, mostra o pop-up surpresa "Você gostou?"
            setTimeout(() => {
                popupGostou.classList.remove('hidden');
            }, 8000);
        }, 10000); // 10 segundos de suspense no total
    }

    // Oculta a tela inicial e mostra a tela do jogo ao clicar no botão
    btnStart.addEventListener('click', () => {
        screenStart.classList.add('hidden');
        screenGame.classList.remove('hidden');
        dispararBrilho();
    });

    // Passa para a escolha de roupas ao clicar em um calçado
    shoeOptions.forEach(option => {
        option.addEventListener('click', () => {
            stepShoes.classList.add('hidden');
            stepClothes.classList.remove('hidden');
            dispararBrilho();
        });
    });

    // Passa para a escolha de maquiagem ao clicar em uma roupa
    clothesOptions.forEach(option => {
        option.addEventListener('click', () => {
            stepClothes.classList.add('hidden');
            stepMakeup.classList.remove('hidden');
            dispararBrilho();
        });
    });

    // Passa para a escolha de cabelo ao clicar em uma maquiagem
    makeupOptions.forEach(option => {
        option.addEventListener('click', () => {
            stepMakeup.classList.add('hidden');
            stepHair.classList.remove('hidden');
            dispararBrilho();
        });
    });

    // Ao escolher o cabelo, mostra o botão para gerar a princesa
    hairOptions.forEach(option => {
        option.addEventListener('click', () => {
            stepHair.classList.add('hidden');
            stepGenerate.classList.remove('hidden');
            dispararBrilho();
        });
    });

    // Pede para assoprar o microfone e escuta o evento de áudio
    btnGenerate.addEventListener('click', async () => {
        btnGenerate.textContent = 'Assopre o pózinho mágico (no microfone)!';
        btnGenerate.disabled = true;
        btnFallback.classList.remove('hidden');

        let audioContext;
        let stream;
        let animationId;

        // Função para encerrar o uso do microfone
        const stopListening = () => {
            if (animationId) cancelAnimationFrame(animationId);
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (audioContext && audioContext.state !== 'closed') audioContext.close();
        };

        // Função para concluir a detecção ou fallback
        const triggerFinal = () => {
            stopListening();
            startFinalSequence();
        };

        // Fallback caso o microfone não funcione, não dê permissão ou a pessoa prefira clicar
        btnFallback.addEventListener('click', () => {
            triggerFinal();
        }, { once: true });

        try {
            // Tenta obter permissão de áudio do usuário
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            
            analyser.fftSize = 256;
            microphone.connect(analyser);
            
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            // Função que checa o volume continuamente
            const checkVolume = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                const average = sum / dataArray.length;
                
                // Sensibilidade do sopro. Média costuma ficar abaixo de 20-30 no silêncio.
                // Quando a pessoa assopra o microfone do celular, passa fácil de 80.
                const blowThreshold = 80; 
                if (average > blowThreshold) {
                    triggerFinal();
                    return; // Para a verificação
                }
                
                animationId = requestAnimationFrame(checkVolume);
            };
            
            checkVolume();
            
        } catch (err) {
            console.warn("Acesso ao microfone não permitido ou não suportado no momento.", err);
            btnGenerate.textContent = 'Sem acesso ao microfone. Use o botão abaixo!';
        }
    });

    // Lógica do botão "Não" fugindo pela tela
    function moveBtnNo() {
        if (fleeCount < 5) {
            fleeCount++;
            btnNo.style.position = 'fixed';
            
            // Calcula uma nova posição aleatória garantindo que o botão não fuja para fora da tela
            const maxX = window.innerWidth - btnNo.offsetWidth - 20;
            const maxY = window.innerHeight - btnNo.offsetHeight - 20;
            
            const randomX = Math.max(10, Math.floor(Math.random() * maxX));
            const randomY = Math.max(10, Math.floor(Math.random() * maxY));

            btnNo.style.left = randomX + 'px';
            btnNo.style.top = randomY + 'px';
        } else {
            // Após 5 fugas, o botão desiste e também vira um botão "Sim"
            btnNo.textContent = 'Sim';
            btnNo.style.position = 'static'; 
            btnNo.style.left = 'auto';
            btnNo.style.top = 'auto';
            btnNo.removeEventListener('mouseover', moveBtnNo);
            btnNo.removeEventListener('click', moveBtnNo);
            btnNo.addEventListener('click', redirectToWhatsapp);
        }
    }

    btnNo.addEventListener('mouseover', moveBtnNo); // Para uso com mouse no PC
    btnNo.addEventListener('click', moveBtnNo);     // Para toques de dedo no celular

    // Lógica de redirecionamento para WhatsApp
    const redirectToWhatsapp = () => window.location.href = `https://wa.me/5579998792211?text=${encodeURIComponent("Muito obrigada Anderson eu adorei")}`;
    btnYes.addEventListener('click', redirectToWhatsapp);
});
