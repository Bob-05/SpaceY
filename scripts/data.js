// ===== ДАННЫЕ О КАРТОЧКАХ =====

const cardData = {
    moon: {
        title: '🌙 Уикенд на Луне',
        price: '$250K / место',
        duration: '3 дня',
        description: 'Ощутите малую гравитацию. Прогулка по исторической базе и проживание в ультра-голубых куполах. Вас ждёт незабываемый вид на Землю с лунной поверхности.',
        includes: ['Проживание в куполе', 'Экскурсия по базе', 'Ужин с видом на Землю', 'Скафандр в подарок'],
        images: [
            'assets/images/routes/moon/moon-1.jpg',
            'assets/images/routes/moon/moon-2.jpg',
            'assets/images/routes/moon/moon-3.jpg',
            'assets/images/routes/moon/moon-4.jpg'
        ]
    },
    mars: {
        title: '🔴 Экспедиция на Марс',
        price: '$3.5M / место',
        duration: '30 дней',
        description: 'Монументальная 30-дневная экспедиция. Исследования роверами в долине Олимп и на красных равнинах. Настоящее приключение для настоящих исследователей.',
        includes: ['Проживание в лагере', 'Исследование на ровере', 'Научные эксперименты', 'Марсианский ужин'],
        images: [
            'assets/images/routes/mars/mars-1.jpg',
            'assets/images/routes/mars/mars-2.jpg',
            'assets/images/routes/mars/mars-3.jpg',
            'assets/images/routes/mars/mars-4.jpg'
        ]
    },
    saturn: {
        title: '🪐 Пролёт колец Сатурна',
        price: '$1.2M / место',
        duration: '7 дней',
        description: 'Круиз параллельно ледяным кольцам. Захватывающая орбитальная траектория с панорамными видами атмосферных полос Сатурна. Фотосессия у колец.',
        includes: ['Облёт колец', 'Фотосессия', 'Научная программа', 'Звёздный ужин'],
        images: [
            'assets/images/routes/saturn/saturn-1.jpg',
            'assets/images/routes/saturn/saturn-2.jpg',
            'assets/images/routes/saturn/saturn-3.jpg',
            'assets/images/routes/saturn/saturn-4.jpg'
        ]
    },
    hotel: {
        title: '🌍 Орбитальный отель',
        price: '$890K / место',
        duration: '5 дней',
        description: '5 дней на низкой орбите, вид на Землю, невесомость и спа-салон с панорамными окнами. Идеальный отдых для тех, кто хочет увидеть Землю с высоты.',
        includes: ['Проживание в отеле', 'Спа-салон', 'Вид на Землю', 'Невесомость'],
        images: [
            'assets/images/routes/hotel/hotel-1.jpg',
            'assets/images/routes/hotel/hotel-2.jpg',
            'assets/images/routes/hotel/hotel-3.jpg',
            'assets/images/routes/hotel/hotel-4.jpg'
        ]
    },
    asteroid: {
        title: '☄️ Облёт астероида',
        price: '$2.1M / место',
        duration: '14 дней',
        description: 'Классический облёт с научной программой. Фотосессия у поверхности и возврат к Земле. Уникальная возможность увидеть астероид вблизи.',
        includes: ['Облёт астероида', 'Научная программа', 'Фотосессия', 'Звёздный ужин'],
        images: [
            'assets/images/routes/asteroid/asteroid-1.jpg',
            'assets/images/routes/asteroid/asteroid-2.jpg',
            'assets/images/routes/asteroid/asteroid-3.jpg',
            'assets/images/routes/asteroid/asteroid-4.jpg'
        ]
    },
    titan: {
        title: '🚀 Старт ARC-TITAN IX',
        price: '$450K / место',
        duration: '2 дня',
        description: 'Сверхзвуковой тур на границу космоса. Невесомость, виды Земли и научный эксперимент. Быстрый и яркий старт для тех, кто хочет попробовать космос на вкус.',
        includes: ['Сверхзвуковой тур', 'Невесомость', 'Научный эксперимент', 'Фотосессия'],
        images: [
            'assets/images/routes/titan/titan-1.jpg',
            'assets/images/routes/titan/titan-2.jpg',
            'assets/images/routes/titan/titan-3.jpg',
            'assets/images/routes/titan/titan-4.jpg'
        ]
    }
};