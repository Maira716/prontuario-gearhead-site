# Prontuário Gearhead - Landing Page 🏎️💨

Este repositório contém o código-fonte da landing page responsiva, moderna e de nível premium do aplicativo **Prontuário Gearhead** (Garagem Virtual). 

O design foi projetado sob medida para entusiastas automotivos, pilotos de track day e gearheads, utilizando uma estética de modo escuro inspirada em fibra de carbono com acentos vibrantes de vermelho e laranja de performance.

---

## 🚀 Recursos Interativos Desenvolvidos

1. **Dinamômetro Virtual**:
   - Simulação dinâmica de ganhos de potência (HP) e torque (Nm).
   - Cálculo automático de perda na roda (**WHP**) baseada no tipo de tração selecionada: FWD (12%), RWD (15%) e AWD (20%).
   - Upgrades aplicáveis (Intake, Escape/Downpipe, Remap Stage 2) que atualizam o gráfico e os indicadores em tempo real.
   - Gráfico de curvas dinâmicas renderizado via vetores SVG baseados em curvas de Bezier reais.

2. **Simulador de Performance 0-100 km/h**:
   - Cálculo físico aproximado de arrancada baseado na relação peso/potência e no tipo de tração.
   - Simulador visual interativo: uma pista de corrida animada que acelera um ícone de carro proporcionalmente ao tempo calculado.

3. **Calculadora Flex Inteligente**:
   - Compare preços de Álcool e Gasolina baseado na eficiência energética média padrão (70%).
   - Indicação visual se o combustível compensa com recomendação clara e porcentagem de economia por quilômetro rodado.

4. **Split Slider de Comparação Light / Dark**:
   - Um slider interativo que permite arrastar uma divisória para comparar a interface do app no tema Carbono Escuro (padrão) com o tema Claro Premium.
   - Implementado de forma 100% vetorial (HTML/CSS) para carregamento instantâneo e nitidez máxima em telas retina.

5. **Gráficos Financeiros Dinâmicos**:
   - Painel demonstrativo simulando o controle financeiro de upgrades, combustível e manutenções do app com animação de entrada.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** & **Tailwind CSS** (via CDN com configurações estendidas de cores e temas).
- **CSS3** para efeitos de glassmorphism, texturas de fibra de carbono matte e animações premium de pulso e flutuação.
- **JavaScript Vanilla (ES6)** para todas as fórmulas físicas, cálculos dinâmicos, renderização de curvas SVG e animações de interface.
- **Vite** como servidor de desenvolvimento local ultra-rápido.

---

## 💻 Como Executar Localmente

### Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado na sua máquina.

### Passos
1. Clone o repositório ou navegue até a pasta do projeto:
   ```bash
   cd "Prontuário Gearhead site"
   ```

2. Instale as dependências de desenvolvimento:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Abra o link gerado no terminal (geralmente `http://localhost:5173`) no seu navegador.

---

## 🌐 Como Subir no GitHub e Hospedar no Vercel

O projeto foi configurado com Git. Siga os passos abaixo para publicar o site:

### 1. Vincular e Enviar para o GitHub
1. Crie um repositório vazio no seu [GitHub](https://github.com/new).
2. No seu terminal local, adicione o repositório remoto criado (substitua pelo seu link do GitHub):
   ```bash
   git remote add origin https://github.com/seu-usuario/prontuario-gearhead-site.git
   ```
3. Renomeie a branch principal para `main` (padrão do GitHub):
   ```bash
   git branch -M main
   ```
4. Suba as alterações locais:
   ```bash
   git push -u origin main
   ```

### 2. Hospedar Gratuitamente no Vercel
1. Acesse o painel da [Vercel](https://vercel.com/) e faça login com sua conta do GitHub.
2. Clique em **"Add New"** > **"Project"**.
3. Importe o repositório `prontuario-gearhead-site` da lista.
4. O Vercel detectará automaticamente a configuração do Vite. Mantenha as configurações padrão e clique em **"Deploy"**.
5. Em poucos segundos, seu site estará no ar com link público (`.vercel.app`) e HTTPS ativo! Toda vez que você der um `git push` na branch principal, o site será atualizado automaticamente.
