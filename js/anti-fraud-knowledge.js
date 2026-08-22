/**
 * 反诈关键词知识库（AI 助手科普来源）
 * 20 条高频电信网络诈骗关键词，每条含【释义】与【警方提示】
 * 由 chat.js 在构建 system prompt 时注入，作为权威科普依据
 * 每条额外提供 keyword_en / desc_en / tip_en 英文对照，供英文模式使用
 */

window.antiFraudKnowledge = [
    {
        keyword: '屏幕共享',
        desc: '在电信网络诈骗案件中，诈骗分子会使用多种话术、套路诱导受害人下载、安装具有屏幕共享功能的应用程序，再利用屏幕共享功能获取受害人的账户信息、银行卡号、验证码等，从而骗取钱款。',
        tip: '在未确认对方身份前，切勿随意点击对方发来的下载链接或开启屏幕共享功能，在涉及资金操作时需格外谨慎。',
        keyword_en: 'Screen Sharing',
        keyword_ru: 'Демонстрация экрана',
        desc_ru: 'В делах о телекоммуникационном и сетевом мошенничестве мошенники используют различные сценарии и приёмы, чтобы побудить жертву скачать и установить приложения с функцией демонстрации экрана, а затем с помощью этой функции получают данные аккаунта жертвы, номер банковской карты, проверочные коды и т. д., похищая деньги.',
        tip_ru: 'Пока личность собеседника не подтверждена, ни в коем случае не нажимайте присланные им ссылки на скачивание и не включайте демонстрацию экрана; при любых операциях с денежными средствами будьте особенно осторожны.',
        desc_en: "In telecom-fraud cases, scammers use various scripts and tactics to trick victims into downloading and installing apps with a screen-sharing feature, then exploit that feature to obtain the victim's account information, bank card number, verification codes, and so on, in order to defraud them of money.",
        tip_en: "Before confirming the other party's identity, never casually click download links they send or enable screen sharing; exercise extra caution whenever funds are involved."
    },
    {
        keyword: '百万保障',
        desc: '「百万保障」是一些支付平台提供的保险服务，并且是自动开启、完全免费的，用户无需支付任何费用。在冒充客服退款类诈骗中，诈骗分子通常以受害人误开启「百万保障」为由，诱导其进行退款操作，从而实施诈骗。',
        tip: '「百万保障」服务是自动开通且完全免费的。如果对「百万保障」相关业务有疑问，应直接联系对应平台的客服，通过官方渠道核实信息。只要接到陌生来电，无论对方以何种理由引导关闭「百万保障」功能设置，均是诈骗！',
        keyword_en: 'Million Guarantee',
        keyword_ru: '«Гарантия на миллион»',
        desc_ru: '«Гарантия на миллион» — это страховая услуга, предлагаемая некоторыми платёжными платформами; она включается автоматически и полностью бесплатна, пользователю не нужно ничего платить. В мошенничестве с возвратом денег под видом службы поддержки мошенники обычно утверждают, что жертва случайно включила «Гарантию на миллион», и побуждают её выполнить операцию возврата, чтобы совершить обман.',
        tip_ru: 'Услуга «Гарантия на миллион» включается автоматически и полностью бесплатна. Если у вас есть вопросы о ней, обращайтесь напрямую в службу поддержки соответствующей платформы и проверяйте информацию по официальным каналам. Любой незнакомый звонок, при котором под любым предлогом вас склоняют отключить «Гарантию на миллион», — это мошенничество!',
        desc_en: "The \"Million Guarantee\" is an insurance service offered by some payment platforms; it is enabled automatically and is entirely free, so users never need to pay anything. In fake-customer-service refund scams, scammers typically claim the victim accidentally activated the \"Million Guarantee\" and then induce them to perform refund operations in order to defraud them.",
        tip_en: "The \"Million Guarantee\" service is automatically enabled and entirely free. If you have any questions about it, contact the platform's customer service directly through official channels. Any unknown caller who, for whatever reason, tries to guide you into disabling the \"Million Guarantee\" is a scammer!"
    },
    {
        keyword: '安全账户',
        desc: '这个词在冒充公检法类诈骗中经常出现。诈骗分子会冒充公检法等国家机关工作人员，以「账户被冻结」「资金有风险」等各种理由要求受害人将资金转入所谓的「安全账户」中，并承诺资金核查完毕后进行返还，从而实施诈骗。',
        tip: '公检法机关没有所谓的「安全账户」！凡是电话中自称公检法等国家机关工作人员要求把资金转到指定账户的，或要求提供银行账号、密码、验证码的，都是诈骗！',
        keyword_en: 'Safe Account',
        keyword_ru: '«Безопасный счёт»',
        desc_ru: 'Этот термин часто встречается в мошенничестве с выдачей себя за полицию, прокуратуру или суд. Мошенники выдают себя за сотрудников государственных органов и под предлогами «счёт заморожен», «средства под угрозой» требуют перевести деньги на так называемый «безопасный счёт», обещая вернуть их после проверки, и таким образом совершают обман.',
        tip_ru: 'У органов полиции, прокуратуры и суда не существует никакого «безопасного счёта»! Любой, кто по телефону, выдавая себя за сотрудника таких органов, требует перевести средства на указанный счёт или сообщить номер банковского счёта, пароль или проверочный код, — мошенник!',
        desc_en: "This term often appears in scams impersonating police, prosecutors, or courts. Scammers pose as staff of such state organs and, citing reasons such as \"your account has been frozen\" or \"your funds are at risk,\" ask victims to transfer money into a so-called \"safe account,\" promising to return it after verification — thereby committing fraud.",
        tip_en: "Public security, procuratorial, and judicial organs have no such thing as a \"safe account\"! Anyone who, over the phone, claims to be staff of these organs and asks you to transfer funds to a designated account, or to provide bank account numbers, passwords, or verification codes, is a scammer!"
    },
    {
        keyword: '修复征信',
        desc: '征信记录是个人或企业在信用机构管理下的信用活动记录。如果征信出现问题将对工作、生活产生重要影响。诈骗分子常常以可以帮助「修复征信」为由，利用受害人急于清除不良记录的心理实施诈骗。',
        tip: '个人征信由中国人民银行征信中心统一管理，任何公司和个人都无权删除和修改。凡是声称可消除不良征信记录的，都是诈骗！',
        keyword_en: 'Credit Repair',
        keyword_ru: 'Исправление кредитной истории',
        desc_ru: 'Кредитная история — это запись о кредитной деятельности физического или юридического лица, ведущаяся кредитными организациями. Проблемы с кредитной историей могут серьёзно повлиять на работу и жизнь. Мошенники часто под предлогом «исправления кредитной истории» используют стремление жертвы удалить негативные записи, чтобы совершить обман.',
        tip_ru: 'Личная кредитная история ведётся исключительно Центром кредитной информации Народного банка Китая; ни одна компания и ни одно лицо не вправе её удалять или изменять. Любой, кто утверждает, что может удалить негативные записи кредитной истории, — мошенник!',
        desc_en: "A credit record is a record of an individual's or business's credit activities managed by credit institutions. Problems with one's credit record can seriously affect work and daily life. Scammers often claim they can \"repair credit,\" exploiting victims' eagerness to remove adverse records to commit fraud.",
        tip_en: "Personal credit records are managed exclusively by the Credit Reference Center of the People's Bank of China; no company or individual has the authority to delete or modify them. Anyone claiming to be able to erase adverse credit records is a scammer!"
    },
    {
        keyword: '刷单做任务',
        desc: '刷单做任务是一种虚假交易行为，通常指商家或个人组织「刷手」进行虚假的商品或服务交易，以提升店铺销量、信誉、排名等。在刷单诈骗中，诈骗分子通常以刷单做任务为由诱导受害人进行转账，前期给予小额返利，当受害人大额转入资金后，诈骗分子随即切断联系。',
        tip: '刷单就是诈骗！网络刷单本身就是违法行为！不要轻信网上「高佣金」「先垫付」等兼职刷单的信息，馅饼之下藏着的是更大的陷阱！',
        keyword_en: 'Order Brushing (Doing Tasks)',
        keyword_ru: 'Накрутка заказов / выполнение заданий',
        desc_ru: 'Накрутка заказов — это фиктивные сделки: продавцы или частные лица организуют «накрутчиков» для совершения фиктивных покупок товаров или услуг, чтобы повысить продажи, репутацию или рейтинг магазина. В мошенничестве с накруткой заказов мошенники под предлогом накрутки побуждают жертву переводить деньги, сначала выплачивая небольшие возвраты, а после перевода жертвой крупной суммы сразу прекращают связь.',
        tip_ru: 'Накрутка заказов — это мошенничество! Сама онлайн-накрутка заказов является незаконной! Не верьте объявлениям о подработке с «накруткой», обещающим «высокие комиссионные» или «предоплату»; под приманкой скрывается ещё большая ловушка!',
        desc_en: "Order brushing is a form of fake transaction in which merchants or individuals organize \"brushers\" to make fake purchases of goods or services to boost a store's sales, reputation, or ranking. In order-brushing scams, scammers induce victims to transfer money under the pretext of brushing orders, paying small rebates at first and then cutting off contact once the victim transfers a large amount.",
        tip_en: "Order brushing is a scam! Online order brushing is itself illegal! Do not believe online part-time \"brushing\" ads promising \"high commissions\" or \"pay first\"; beneath the pie lies an even bigger trap!"
    },
    {
        keyword: '色情小卡片',
        desc: '「色情小卡片」是刷单诈骗的变种引流手段。诈骗分子以色情信息为诱饵，在一些公共场所散发附有二维码或联系电话的小卡片，吸引受害人扫码。受害人一旦通过卡片上信息与诈骗分子取得联系，就会被诱导进入「刷单返利」「同城约会」等群聊或虚假平台。诈骗分子通常以「完成任务即可获取色情服务或高额报酬」为诱饵，要求受害人垫资刷单、充值转账，从而实施诈骗。',
        tip: '传播色情信息及刷单均属于违法行为，切勿因猎奇或贪利陷入电诈分子的圈套！',
        keyword_en: 'Pornographic Cards',
        keyword_ru: 'Порнографические карточки',
        desc_ru: '«Порнографические карточки» — это разновидность привлечения жертв для мошенничества с накруткой заказов. Мошенники используют порнографический контент как приманку, раскладывая в общественных местах карточки с QR-кодом или номером телефона, чтобы заманить жертву отсканировать их. Как только жертва связывается с мошенником по данным на карточке, её вовлекают в групповые чаты или на фальшивые платформы с предложениями «возврата за накрутку» или «свидания в одном городе». Обычно мошенники под предлогом «выполните задания и получите сексуальные услуги или крупное вознаграждение» требуют от жертвы предоплаты, пополнения счёта и переводов, совершая обман.',
        tip_ru: 'Распространение порнографии и накрутка заказов являются незаконными. Не попадайтесь в ловушку телекоммуникационных мошенников из любопытства или жадности!',
        desc_en: "\"Pornographic cards\" are a variant lead-generation tactic for order-brushing scams. Scammers use pornographic content as bait, distributing small cards bearing QR codes or phone numbers in public places to lure victims into scanning. Once a victim contacts the scammer through the card's information, they are steered into group chats or fake platforms advertising \"brushing rebates\" or \"same-city dating.\" Typically, scammers promise \"sexual services or high pay upon completing tasks\" and demand that victims advance funds, top up, and transfer money — thereby committing fraud.",
        tip_en: "Both distributing pornographic material and order brushing are illegal. Do not fall into telecom-fraud traps out of curiosity or greed!"
    },
    {
        keyword: '未知链接、二维码',
        desc: '未知链接、二维码是指来源不明、无法确定其安全性和真实性的网络链接、二维码。这类链接和二维码常常混入大量广告引流信息，并通过电子邮件、短信、短视频平台、社交软件等渠道发送给用户。当用户点击访问时，可能被引导至恶意网站，进而被不法分子获取个人信息；也可能被诱导下载病毒、木马程序或其他诈骗软件。',
        tip: '谨慎对待未知链接和二维码，避免随意点击或扫描，保护个人信息和设备安全，防止财产遭受损失。',
        keyword_en: 'Unknown Links and QR Codes',
        keyword_ru: 'Неизвестные ссылки и QR-коды',
        desc_ru: 'Неизвестные ссылки и QR-коды — это ссылки или коды неясного происхождения, безопасность и подлинность которых невозможно проверить. Они часто содержат рекламу и привлечение трафика и рассылаются пользователям по электронной почте, SMS, через платформы коротких видео и мессенджеры. Переход по ним может привести на вредоносные сайты, где злоумышленники получают личные данные, либо побудить скачать вирусы, трояны или другое мошенническое ПО.',
        tip_ru: 'Относитесь к неизвестным ссылкам и QR-кодам с осторожностью, не нажимайте и не сканируйте их без необходимости, защищая личную информацию и устройство от имущественного ущерба.',
        desc_en: "Unknown links and QR codes are links or codes of unclear origin whose security and authenticity cannot be verified. They are often bundled with advertising or lead-generation content and sent to users via email, SMS, short-video platforms, or social apps. Clicking them may redirect users to malicious websites where criminals harvest personal information, or trick them into downloading viruses, trojans, or other scam software.",
        tip_en: "Treat unknown links and QR codes with caution; avoid clicking or scanning casually to protect your personal information and device security and to prevent property loss."
    },
    {
        keyword: '境外来电',
        desc: '境外来电指的是来自其他国家或地区的电话呼叫。境外来电是电信网络诈骗最常见的一种引流方式，来电号码通常以「+」或「00」开头，大多为虚拟号码。如果挂断电话再回拨该号码，经常会提示是空号或忙音。',
        tip: '没有海外关系情况下，接到境外来电，几乎都是诈骗电话！在收到运营商境外来电提醒服务弹窗信息后，一定要保持高度警惕，及时甄别号码来源。如确无境外通联需要，建议联系运营商开通拦截境外来电服务，从源头上防范电信网络诈骗。',
        keyword_en: 'Overseas Calls',
        keyword_ru: 'Звонки из-за рубежа',
        desc_ru: 'Звонки из-за рубежа — это звонки, поступающие из других стран или регионов. Это один из самых распространённых способов привлечения жертв в телекоммуникационном мошенничестве; номера обычно начинаются с «+» или «00» и в основном являются виртуальными. Если перезвонить на такой номер, он часто оказывается несуществующим или занятым.',
        tip_ru: 'Если у вас нет зарубежных контактов, звонок из-за рубежа почти наверняка мошеннический! Получив уведомление оператора о зарубежном звонке, сохраняйте повышенную бдительность и своевременно проверяйте происхождение номера. Если зарубежные звонки вам не нужны, обратитесь к оператору для включения их блокировки и предотвращения телекоммуникационного мошенничества.',
        desc_en: "Overseas calls are phone calls originating from other countries or regions. They are one of the most common lead-generation methods in telecom fraud; the calling numbers usually start with \"+\" or \"00\" and are mostly virtual numbers. If you hang up and call back, the number often turns out to be non-existent or busy.",
        tip_en: "If you have no overseas contacts, an overseas call is almost certainly a scam call! When you receive a carrier alert about an overseas call, stay highly vigilant and promptly verify the number's origin. If you have no genuine need for overseas calls, contact your carrier to enable overseas-call blocking and prevent telecom fraud at the source."
    },
    {
        keyword: '小众聊天软件',
        desc: '小众聊天软件系用户基数相对较小、知名度较低的聊天类应用，极易被电信网络诈骗分子用来隐匿犯罪行为、销毁犯罪证据，有的甚至专门用来实施电诈犯罪，社会危害性极大。',
        tip: '警惕小众聊天软件成为诈骗工具！切勿点击陌生链接下载陌生软件，如有下载软件需求请通过官方应用市场等正规渠道！',
        keyword_en: 'Niche Chat Apps',
        keyword_ru: 'Малоизвестные мессенджеры',
        desc_ru: 'Малоизвестные мессенджеры — это приложения для общения с относительно небольшой базой пользователей и низкой известностью. Их легко используют мошенники для сокрытия преступной деятельности и уничтожения улик; некоторые даже создаются специально для телекоммуникационного мошенничества и представляют большую общественную опасность.',
        tip_ru: 'Остерегайтесь, что малоизвестные мессенджеры становятся инструментом мошенников! Никогда не нажимайте незнакомые ссылки для скачивания неизвестного ПО; скачивайте приложения только из официальных магазинов и других легальных источников!',
        desc_en: "Niche chat apps are chat applications with a relatively small user base and low visibility. They are readily used by telecom-fraud scammers to conceal criminal activity and destroy evidence; some are even purpose-built for telecom fraud, posing significant social harm.",
        tip_en: "Beware of niche chat apps being used as fraud tools! Never click unfamiliar links to download unknown software; download apps only through official app stores or other legitimate channels!"
    },
    {
        keyword: '内幕消息',
        desc: '在电信网络诈骗案件中，「内幕消息」是诈骗分子常用的话术陷阱。诈骗分子通过虚构或夸大「内部消息」「独家情报」等概念，诱导受害人进行所谓「稳赚不赔」的投资或交易，从而实施诈骗。',
        tip: '凡是宣称「内幕消息、稳赚不赔、高额回报」的投资理财，都是诈骗！',
        keyword_en: 'Inside Information',
        keyword_ru: 'Инсайдерская информация',
        desc_ru: 'В делах о телекоммуникационном мошенничестве «инсайдерская информация» — это распространённая словесная ловушка. Мошенники выдумывают или преувеличивают понятия «внутренние новости», «эксклюзивные сведения» и т. п., побуждая жертву к якобы «беспроигрышным» инвестициям или сделкам, чтобы совершить обман.',
        tip_ru: 'Любые инвестиции или управление капиталом, обещающие «инсайдерскую информацию, гарантированную прибыль, высокую доходность», — это мошенничество!',
        desc_en: "In telecom-fraud cases, \"inside information\" is a common verbal trap. Scammers fabricate or exaggerate notions such as \"internal news\" or \"exclusive intelligence\" to lure victims into supposedly \"risk-free\" investments or trades, thereby committing fraud.",
        tip_en: "Any investment or wealth-management pitch promising \"inside information, guaranteed profits, or high returns\" is a scam!"
    },
    {
        keyword: 'NFC盗刷',
        desc: '目前，NFC技术应用广泛，如移动支付、公共交通、门禁卡等等。然而，这项便捷的技术也被一些不法分子所利用。诈骗分子会要求受害人将手机与银行卡贴靠，通过NFC功能，使银行卡信息与手机上的虚拟App软件绑定，直接读取并转移卡内资金。',
        tip: '切勿随意将手机与银行卡进行贴靠，谨慎通过手机NFC功能进行陌生支付操作。',
        keyword_en: 'NFC Skimming',
        keyword_ru: 'Скимминг через NFC',
        desc_ru: 'В настоящее время технология NFC широко применяется: мобильные платежи, общественный транспорт, пропуска и т. д. Однако этой удобной технологией пользуются и злоумышленники. Мошенники просят жертву приложить телефон к банковской карте; через NFC данные карты привязываются к виртуальному приложению на телефоне, что позволяет напрямую считывать и переводить средства с карты.',
        tip_ru: 'Не прикладывайте телефон к банковской карте без необходимости и осторожно относитесь к незнакомым платежам через NFC.',
        desc_en: "NFC technology is widely used today in mobile payment, public transit, access cards, and more. However, this convenient technology is also exploited by criminals. Scammers ask victims to place their phone against their bank card; through NFC, the card's information is bound to a virtual app on the phone, allowing the funds to be read out and transferred directly.",
        tip_en: "Never casually bring your phone into contact with your bank card, and exercise caution with unfamiliar payments via your phone's NFC feature."
    },
    {
        keyword: '积分清零',
        desc: '当前，大量平台、网站实行积分制管理，用户积攒一定积分可以使用相关服务或兑换相关礼品。积分通常具有一定期限，如未及时使用将会过期或被清零。诈骗分子通常以「积分清零」为由进行引流，诱导受害人点击诈骗链接，进而实施诈骗。',
        tip: '切勿轻信非官方渠道发布的积分清零通知，避免盲目操作落入诈骗陷阱。面对积分兑换或清零提醒，应直接通过官方客服热线、官方网站或App等正规渠道进行核实。',
        keyword_en: 'Points Clearing',
        keyword_ru: 'Обнуление баллов',
        desc_ru: 'Многие платформы и сайты используют бонусные программы; накопив баллы, пользователь может получать услуги или обменивать их на подарки. Баллы обычно имеют срок действия; если их не использовать, они сгорают или обнуляются. Мошенники часто используют «обнуление баллов» как предлог для привлечения жертв, побуждая их нажимать мошеннические ссылки и совершая обман.',
        tip_ru: 'Не верьте уведомлениям об обнулении баллов из неофициальных источников и не совершайте необдуманных действий, ведущих в ловушку. При любых уведомлениях об обмене или обнулении баллов проверяйте их по официальной горячей линии, официальному сайту или приложению.',
        desc_en: "Many platforms and websites now run points/loyalty programs, allowing users to redeem points for services or gifts. Points usually have an expiry; if unused, they expire or are cleared. Scammers often use \"points about to be cleared\" as a lead-generation pretext, inducing victims to click fraudulent links and thereby commit fraud.",
        tip_en: "Do not trust \"points clearing\" notices from unofficial channels, and avoid blindly acting on them and falling into a scam trap. For any points-redemption or clearing notice, verify through official channels such as the customer-service hotline, official website, or app."
    },
    {
        keyword: '快递引流',
        desc: '快递引流是指诈骗分子利用快递包裹作为媒介，通过在快递包裹里附加传单或小礼品吸引受害人注意，引导受害人扫码添加联系方式，再将其拉入诈骗群聊中，进而实施诈骗。',
        tip: '天下没有免费的午餐，不要随意扫描快递里的二维码，遇到邀请进群、转发可领礼品等情况，务必高度警惕！',
        keyword_en: 'Courier-Based Lead Generation',
        keyword_ru: 'Привлечение через посылки',
        desc_ru: 'Привлечение через посылки — это способ, при котором мошенники используют посылки как носитель: вкладывая в них листовки или мелкие подарки, они привлекают внимание жертвы, побуждают её отсканировать QR-код и добавить контакт, затем затягивают в мошеннические групповые чаты и совершают обман.',
        tip_ru: 'Бесплатного сыра не бывает. Не сканируйте QR-коды внутри посылок без необходимости; будьте крайне бдительны при приглашениях вступить в группы или «переслать, чтобы получить подарок»!',
        desc_en: "Courier-based lead generation is a tactic in which scammers use parcels as a medium, attaching flyers or small gifts to attract victims' attention and induce them to scan a QR code and add a contact, then pulling them into scam group chats to commit fraud.",
        tip_en: "There is no free lunch. Do not casually scan QR codes found in parcels, and stay highly vigilant against invitations to join groups or \"forward to receive gifts.\""
    },
    {
        keyword: '虚拟货币',
        desc: '当前，利用虚拟货币洗钱已成为犯罪分子实施诈骗以及转移涉诈资金的手法之一。诈骗分子通常以「虚拟货币投资理财」为名搭建虚假平台诱导受害人进行投资，并以线上交易存在风险等理由，扮演「币商」上门指导受害人操作，从而骗取受害人钱财。',
        tip: '虚拟货币交易不受法律保护，所谓「兑换虚拟币投资」均为诈骗！',
        keyword_en: 'Virtual Currency',
        keyword_ru: 'Виртуальная валюта',
        desc_ru: 'В настоящее время отмывание денег через виртуальную валюту стало одним из способов, которым преступники совершают мошенничество и перемещают похищенные средства. Мошенники обычно под видом «инвестиций в виртуальную валюту» создают фальшивые платформы, заманивают жертву вкладывать деньги, а затем, ссылаясь на риски онлайн-торговли, приходят к жертве под видом «торговца валютой» и руководят её действиями, похищая деньги.',
        tip_ru: 'Торговля виртуальной валютой не защищена законом, а так называемые «инвестиции в виртуальную валюту» — это мошенничество!',
        desc_en: "Laundering money through virtual currency has become one of the methods criminals use to commit fraud and move illicit funds. Scammers typically build fake platforms under the guise of \"virtual-currency investment\" to lure victims into investing, then, citing risks in online trading, pose as \"coin dealers\" who visit in person to guide the victim's operations — thereby defrauding them.",
        tip_en: "Virtual-currency trading is not protected by law, and so-called \"virtual-currency investment\" is a scam!"
    },
    {
        keyword: '电诈工具人',
        desc: '「电诈工具人」是对帮助电诈团伙实施违法犯罪行为相关人员的统称。在电信网络诈骗犯罪链条中，诈骗分子为完成违法犯罪行为，需要大肆收购、获取「两卡」和个人信息，发展跑分洗钱、推广引流等网络黑灰产，利用多种手段诱骗群众成为「电诈工具人」。',
        tip: '订购现金花束、扫码送礼品、帮助取现、出售电话卡和银行卡……这些看似平常的事情很有可能「埋雷」。面对花样百出的诱骗手法，务必增强自身识骗、防骗、拒骗能力，不做「电诈工具人」。',
        keyword_en: 'Fraud "Tool Person"',
        keyword_ru: '«Инструмент» телекоммуникационных мошенников',
        desc_ru: '«Инструмент» телекоммуникационных мошенников — обобщённое название людей, помогающих мошенническим группировкам совершать незаконные действия. В цепочке телекоммуникационного мошенничества мошенники массово скупают и добывают «две карты» и личные данные, развивают подпольный бизнес по отмыванию денег и привлечению трафика, различными способами обманом превращая людей в «инструменты» мошенников.',
        tip_ru: 'Заказ денежных букетов, сканирование кодов за подарки, помощь в снятии наличных, продажа телефонных и банковских карт — эти, казалось бы, обычные действия могут быть «заминированы». Перед лицом разнообразных приёмов обмана повышайте способность распознавать, предотвращать и отвергать мошенничество и не становитесь «инструментом» мошенников.',
        desc_en: "The fraud \"tool person\" is a collective term for people who help telecom-fraud gangs carry out illegal acts. Within the telecom-fraud crime chain, scammers need to acquire \"two cards\" and personal information in bulk, develop underground businesses such as \"running points\" money laundering and lead generation, and use various means to trick people into becoming fraud \"tool persons.\"",
        tip_en: "Ordering cash bouquets, scanning codes for gifts, helping withdraw cash, or selling phone cards and bank cards — these seemingly ordinary acts may be booby-trapped. In the face of ever-changing deception tactics, sharpen your ability to recognize, prevent, and refuse fraud, and never become a fraud \"tool person.\""
    },
    {
        keyword: '帮信行为',
        desc: '「帮信行为」是指帮助信息网络犯罪活动的行为，即明知他人利用信息网络实施犯罪，仍为其提供技术支持或帮助的行为。根据《中华人民共和国刑法》第二百八十七条之二规定，该行为可能构成帮助信息网络犯罪活动罪，情节严重的可判处三年以下有期徒刑或拘役，并处或单处罚金。',
        tip: '「帮信行为」看似获利，实则可能沦为诈骗分子的帮凶，将面临法律严惩。任何出租、出售「两卡」或参与引流、洗钱的行为均属违法犯罪，切勿贪小失大！',
        keyword_en: 'Aiding Information-Network Crimes',
        keyword_ru: 'Пособничество информационным преступлениям',
        desc_ru: '«Пособничество информационным преступлениям» — это оказание помощи преступной деятельности с использованием информационных сетей, то есть заведомое предоставление технической поддержки или помощи другим лицам, использующим информационные сети для совершения преступлений. Согласно статье 287-2 Уголовного кодекса Китайской Народной Республики, такие действия могут образовывать состав преступления пособничества преступной деятельности с использованием информационных сетей; при отягчающих обстоятельствах наказывается лишением свободы на срок до трёх лет или арестом с одновременным или отдельным штрафом.',
        tip_ru: '«Пособничество информационным преступлениям» кажется выгодным, но на деле может сделать вас пособником мошенников и повлечь суровое наказание по закону. Любая сдача в аренду или продажа «двух карт» либо участие в привлечении трафика или отмывании денег является незаконной; не теряйте большого ради малой выгоды!',
        desc_en: "\"Aiding information-network crimes\" refers to knowingly providing technical support or assistance to others who use information networks to commit crimes. Under Article 287-2 of the Criminal Law of the People's Republic of China, such conduct may constitute the crime of aiding information-network criminal activities; in serious cases it is punishable by up to three years' fixed-term imprisonment or criminal detention, with a fine imposed concurrently or separately.",
        tip_en: "\"Aiding information-network crimes\" may look profitable but actually makes you an accomplice of scammers and carries severe legal consequences. Any renting or selling of \"two cards,\" or participation in lead generation or money laundering, is illegal; never lose big over a small gain!"
    },
    {
        keyword: '两卡',
        desc: '「两卡」是手机卡和银行卡的统称。手机卡不仅包括日常使用的移动、电信、联通、广电等运营商的电话卡，还包括虚拟运营商的电话卡以及物联网卡。银行卡包括个人银行卡、对公账户、结算卡以及非银行支付机构账户，如微信、支付宝等第三方支付平台。',
        tip: '买卖或租借「两卡」均涉嫌违法。切勿将自己的手机卡、银行卡以及微信、支付宝等第三方支付平台账户出租、出售他人！',
        keyword_en: '"Two Cards"',
        keyword_ru: '«Две карты»',
        desc_ru: '«Две карты» — общее название телефонной и банковской карт. К телефонным картам относятся не только SIM-карты операторов China Mobile, China Telecom, China Unicom и China Broadnet, но и карты виртуальных операторов и IoT-карты. К банковским картам относятся личные банковские карты, корпоративные счета, расчётные карты, а также счета небанковских платёжных организаций, таких как WeChat Pay и Alipay.',
        tip_ru: 'Покупка, продажа или сдача в аренду «двух карт» подозревается в нарушении закона. Никогда не сдавайте в аренду и не продавайте другим свою телефонную карту, банковскую карту или аккаунты платёжных платформ WeChat Pay, Alipay и др.!',
        desc_en: "The \"two cards\" refer collectively to phone cards and bank cards. Phone cards include not only everyday SIM cards from China Mobile, China Telecom, China Unicom, and China Broadnet, but also virtual-operator phone cards and IoT cards. Bank cards include personal bank cards, corporate accounts, settlement cards, and accounts at non-bank payment institutions such as WeChat Pay and Alipay.",
        tip_en: "Buying, selling, or renting out the \"two cards\" is suspected of being illegal. Never rent or sell your phone card, bank card, or third-party payment accounts (WeChat Pay, Alipay, etc.) to others!"
    },
    {
        keyword: '现金黄金',
        desc: '这是一种新型洗钱手段。在电诈案件中，诈骗分子通常以各种理由诱导受害人进行线下取现、购买黄金或其他易变现物品等操作，再通过跑腿、网约车、快递等方式将现金或财物直接交付给指定人员，以逃避资金监管和侦查打击。',
        tip: '凡是要求取出现金或者购买黄金，并通过货运、网约车、邮寄或者跑腿等方式转交给陌生人的，都是诈骗洗钱手法！',
        keyword_en: 'Cash / Gold Laundering',
        keyword_ru: 'Наличные / золото',
        desc_ru: 'Это новый способ отмывания денег. В делах о телекоммуникационном мошенничестве мошенники под разными предлогами побуждают жертву снять наличные офлайн, купить золото или другие легко реализуемые предметы, а затем через курьеров, такси, службы доставки и т. п. передают наличные или ценности указанному лицу, чтобы избежать контроля за средствами и следствия.',
        tip_ru: 'Любое требование снять наличные или купить золото и передать их незнакомцу через грузоперевозку, такси, почту или курьера — это мошенническая схема отмывания денег!',
        desc_en: "This is a new money-laundering method. In telecom-fraud cases, scammers use various pretexts to induce victims to withdraw cash offline, buy gold or other easily liquidated items, and then have the cash or valuables delivered directly to a designated person via errand runners, ride-hailing, or courier services, so as to evade fund supervision and investigation.",
        tip_en: "Anyone who asks you to withdraw cash or buy gold and hand it to a stranger via freight, ride-hailing, mail, or errand runners is using a scam money-laundering tactic!"
    },
    {
        keyword: '购物卡',
        desc: '为逃避资金追查，诈骗分子通常要求受害人将资金转换为购物卡，从而进行套现洗钱。',
        tip: '凡是要求大量购买购物卡并提供卡号和密码的，务必提高警惕！',
        keyword_en: 'Gift Cards',
        keyword_ru: 'Подарочные карты',
        desc_ru: 'Чтобы избежать отслеживания средств, мошенники обычно требуют от жертвы перевести средства в подарочные карты, чтобы затем обналичить их и отмыть деньги.',
        tip_ru: 'Будьте крайне бдительны, если кто-то требует массово покупать подарочные карты и сообщать номера карт и пароли!',
        desc_en: "To evade fund tracing, scammers usually ask victims to convert funds into gift cards in order to cash out and launder money.",
        tip_en: "Be highly vigilant against anyone who asks you to buy large amounts of gift cards and provide the card numbers and passwords!"
    },
    {
        keyword: '刷流水',
        desc: '「刷流水」是指通过制造虚假的资金流动记录，从而增加账户交易流水的行为，主要用于提升信用评级或满足贷款审批要求。诈骗分子通常以「刷流水」为由，诱导受害人向指定账户转账。',
        tip: '「刷流水」是一种违法行为。如在办理相关服务时，遇到对方要求「刷流水」的，务必提高警惕，切勿向对方指定的账户转账。',
        keyword_en: 'Fake Transaction Flow',
        keyword_ru: 'Накрутка оборотов по счёту',
        desc_ru: '«Накрутка оборотов по счёту» — это создание фиктивных записей о движении средств для увеличения оборотов по счёту, в основном для повышения кредитного рейтинга или соответствия требованиям при одобрении кредита. Мошенники обычно под предлогом «накрутки оборотов» побуждают жертву переводить деньги на указанные счета.',
        tip_ru: '«Накрутка оборотов по счёту» — это незаконное действие. Если при оформлении услуг кто-то требует «накрутить обороты», будьте крайне бдительны и ни в коем случае не переводите деньги на указанный им счёт.',
        desc_en: "\"Fake transaction flow\" refers to creating fabricated fund-transfer records to inflate an account's transaction volume, mainly to boost credit ratings or satisfy loan-approval requirements. Scammers usually use \"brushing transaction flow\" as a pretext to induce victims to transfer money to designated accounts.",
        tip_en: "\"Fake transaction flow\" is illegal. If, while applying for a service, someone asks you to \"brush transaction flow,\" stay highly vigilant and never transfer money to the account they designate."
    }
];
