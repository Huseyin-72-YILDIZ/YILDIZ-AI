class WikipediaAI {
    constructor() {
        // Ana elementler
        this.sidebar = document.querySelector('.sidebar');
        this.messages = document.querySelector('.messages');
        this.textarea = document.querySelector('.input-wrapper textarea');
        this.sendButton = document.querySelector('.send-btn');
        this.voiceButton = document.querySelector('.voice-btn');
        this.clearAllButton = document.querySelector('.clear-all-btn');
        this.languageSelect = document.querySelector('.language-select');
        this.chatList = document.querySelector('.chat-list');
        this.newChatButton = document.querySelector('.new-chat-btn');
        this.chatTitle = document.querySelector('.chat-title');
        this.chatContext = document.querySelector('.chat-context');
        this.toggleSidebarButton = document.querySelector('.toggle-sidebar');

        // Sabit değerler
        this.currentUser = 'Kullanıcı';
        this.currentTime = '2025-04-17 13:11:45';
        this.currentChatId = Date.now().toString();
        
        // Durum değişkenleri
        this.baseUrl = 'https://tr.wikipedia.org/w/api.php';
        this.recognition = null;
        this.isRecording = false;
        this.isSidebarVisible = true;

        // Temel bot yanıtları
        this.basicResponses = {
            "adın ne": "Benim adım YILDIZ AI. Hüseyin YILDIZ tarafından geliştirilen bir Wikipedia asistanıyım.",
            "seni kim yaptı": "Beni Hüseyin YILDIZ geliştirdi. 2025 yılında Wikipedia'yı daha erişilebilir kılmak için oluşturuldum.",
            "ne yapabilirsin": "Size Wikipedia'dan bilgi arayabilir, görseller bulabilir, sesli komutları anlayabilir ve çoklu dil desteği ile hizmet verebilirim.",
            "merhaba": "Merhaba! Size nasıl yardımcı olabilirim?",
            "selam": "Selam! Size nasıl yardımcı olabilirim?",
            "kimsin": "Ben YILDIZ AI, Hüseyin YILDIZ tarafından geliştirilen bir Wikipedia asistanıyım. Size bilgi aramada yardımcı olabilirim.",
            "nasılsın": "İyiyim, teşekkür ederim! Size nasıl yardımcı olabilirim?",
            "yildiz ai": "Evet, ben YILDIZ AI! Size nasıl yardımcı olabilirim?",
            "görüşürüz": "Görüşmek üzere! Başka bir sorunuz olursa ben buradayım.",
            "teşekkürler": "Rica ederim! Başka bir konuda yardımcı olabilirim.",
            "teşekkür ederim": "Rica ederim! Başka bir konuda yardımcı olabilirim."
        };

        // Dil çevirileri
        this.translations = {
            tr: {
                welcome: `Merhaba ${this.currentUser}! Ben YILDIZ AI Bilgi Asistanı.\n\nSize nasıl yardımcı olabilirim?`,
                newChat: 'Yeni Sohbet',
                searchPlaceholder: 'Aramak istediğiniz konuyu yazın...',
                chatHistory: 'Sohbet Geçmişi',
                clearConfirm: 'Tüm sohbet geçmişini silmek istediğinize emin misiniz?',
                copySuccess: 'Metin kopyalandı!',
                downloadSuccess: 'Görsel indirildi!',
                error: 'Bir hata oluştu!',
                viewImage: 'Görseli Aç',
                downloadImage: 'İndir',
                viewOnWiki: 'Kaynağında Görüntüle',
                noResults: 'Sonuç bulunamadı.',
                searchError: 'Arama sırasında bir hata oluştu.',
                deleteChatConfirm: 'Bu sohbeti silmek istediğinize emin misiniz?',
                editChatTitle: 'Yeni sohbet başlığını girin:'
            },
            kmr: {
                welcome: `Silav ${this.currentUser}! Ez YILDIZ AI Alîkarê Agahî me.Ez çawa dikarim alîkariya we bikim?`,
                newChat: 'Sohbeta Nû',
                searchPlaceholder: 'Mijara ku hûn dixwazin lê bigerin binivîsin...',
                chatHistory: 'Dîroka Sohbetê',
                clearConfirm: 'Hûn dixwazin hemû dîroka sohbetê paqij bikin?',
                copySuccess: 'Nivîs hat kopîkirin!',
                downloadSuccess: 'Wêne hat daxistin!',
                error: 'Çewtiyek derket!',
                viewImage: 'Wêneyê Veke',
                downloadImage: 'Daxe',
                viewOnWiki: 'Li Kaynağa Wi Bibîne',
                noResults: 'Tu encam nehat dîtin.',
                searchError: 'Di lêgerînê de çewtiyek derket.',
                deleteChatConfirm: 'Hûn dixwazin vê sohbetê jê bibin?',
                editChatTitle: 'Sernavê sohbeta nû binivîse:'
            },
            en: {
                welcome: `Hello ${this.currentUser}! I'm YILDIZ AI İnformation Assistant.How can I help you?`,
                newChat: 'New Chat',
                searchPlaceholder: 'Type what you want to search...',
                chatHistory: 'Chat History',
                clearConfirm: 'Are you sure you want to clear all chat history?',
                copySuccess: 'Text copied!',
                downloadSuccess: 'Image downloaded!',
                error: 'An error occurred!',
                viewImage: 'Open Image',
                downloadImage: 'Download',
                viewOnWiki: 'View on source',
                noResults: 'No results found.',
                searchError: 'An error occurred during search.',
                deleteChatConfirm: 'Are you sure you want to delete this chat?',
                editChatTitle: 'Enter new chat title:'
            }
        };

        this.initializeEventListeners();
        this.initializeSpeechRecognition();
        this.loadChatHistory();
        this.updateUILanguage();
        this.showWelcomeMessage();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleUserInput());
        this.textarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });
        this.textarea.addEventListener('input', () => this.adjustTextareaHeight());
        this.voiceButton.addEventListener('click', () => this.toggleVoiceInput());
        this.clearAllButton.addEventListener('click', () => this.clearChatHistory());
        this.languageSelect.addEventListener('change', () => this.changeLanguage());
        this.newChatButton.addEventListener('click', () => this.startNewChat());
        this.chatTitle.addEventListener('change', () => this.updateChatTitle());
        this.chatContext.addEventListener('change', () => this.updateChatContext());
        this.toggleSidebarButton.addEventListener('click', () => this.toggleSidebar());

        // Modal kapatma
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('aboutModal').style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('aboutModal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Responsive kontrol
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        if (window.innerWidth <= 768) {
            this.sidebar.classList.add('hidden');
            this.isSidebarVisible = false;
            document.querySelector('.main-content').classList.add('full-width');
        }
    }

    adjustTextareaHeight() {
        this.textarea.style.height = 'auto';
        this.textarea.style.height = Math.min(this.textarea.scrollHeight, 150) + 'px';
    }

    toggleSidebar() {
        this.isSidebarVisible = !this.isSidebarVisible;
        this.sidebar.classList.toggle('hidden');
        document.querySelector('.main-content').classList.toggle('full-width');
        this.toggleSidebarButton.innerHTML = this.isSidebarVisible ? 
            '<i class="fas fa-times"></i>' : 
            '<i class="fas fa-bars"></i>';
    }

    getTranslation(key) {
        const currentLang = this.languageSelect.value;
        return this.translations[currentLang]?.[key] || this.translations['en'][key];
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            const currentLang = this.languageSelect.value;
            this.recognition.lang = currentLang === 'kmr' ? 'ku-TR' : `${currentLang}-${currentLang.toUpperCase()}`;

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.textarea.value = transcript;
                this.handleUserInput();
            };

            this.recognition.onend = () => {
                this.isRecording = false;
                this.voiceButton.classList.remove('recording');
            };

            this.recognition.onerror = (event) => {
                console.error('Ses tanıma hatası:', event.error);
                this.isRecording = false;
                this.voiceButton.classList.remove('recording');
                this.showToast(this.getTranslation('error'), 'error');
            };
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.showToast(this.getTranslation('error'), 'error');
            return;
        }

        if (this.isRecording) {
            this.recognition.stop();
        } else {
            this.recognition.start();
            this.isRecording = true;
            this.voiceButton.classList.add('recording');
        }
    }

    changeLanguage() {
        const lang = this.languageSelect.value;
        
        if (lang === 'kmr') {
            this.baseUrl = 'https://ku.wikipedia.org/w/api.php';
        } else {
            this.baseUrl = `https://${lang}.wikipedia.org/w/api.php`;
        }

        if (this.recognition) {
            this.recognition.lang = lang === 'kmr' ? 'ku-TR' : `${lang}-${lang.toUpperCase()}`;
        }

        this.updateUILanguage();
        this.saveChatToHistory();
    }

    updateUILanguage() {
        this.textarea.placeholder = this.getTranslation('searchPlaceholder');
        this.newChatButton.innerHTML = `<i class="fas fa-plus"></i> ${this.getTranslation('newChat')}`;
        document.querySelector('.chats-header h2').textContent = this.getTranslation('chatHistory');
    }

    async handleUserInput() {
        const searchTerm = this.textarea.value.trim();
        
        if (searchTerm) {
            this.addMessage('user', searchTerm);
            this.textarea.value = '';
            this.textarea.style.height = 'auto';
            
            // Gönderme animasyonu
            this.sendButton.classList.add('sending');
            setTimeout(() => this.sendButton.classList.remove('sending'), 500);

            // Temel yanıtları kontrol et
            const lowerSearchTerm = searchTerm.toLowerCase();
            if (this.basicResponses[lowerSearchTerm]) {
                this.addMessage('bot', this.basicResponses[lowerSearchTerm]);
            } else {
                await this.searchWikipedia(searchTerm);
            }
        }
    }

    async searchWikipedia(searchTerm) {
        try {
            const searchResults = await this.getWikipediaResults(searchTerm);
            
            if (searchResults.length > 0) {
                const firstResult = searchResults[0];
                const content = await this.getArticleContent(firstResult.pageid);
                const images = await this.getArticleImages(firstResult.title);
                
                this.addMessage('bot', content, {
                    title: firstResult.title,
                    images: images,
                    link: `https://${this.languageSelect.value}.wikipedia.org/?curid=${firstResult.pageid}`
                });
            } else {
                this.addMessage('bot', this.getTranslation('noResults'));
            }
        } catch (error) {
            console.error('Arama hatası:', error);
            this.addMessage('bot', this.getTranslation('searchError'));
        }
    }

    async getWikipediaResults(query) {
        const params = {
            action: 'query',
            format: 'json',
            list: 'search',
            srsearch: query,
            utf8: '1',
            srlimit: 1,
            origin: '*'
        };

        const response = await fetch(`${this.baseUrl}?${new URLSearchParams(params)}`);
        const data = await response.json();
        return data.query.search;
    }

    async getArticleContent(pageId) {
        const params = {
            action: 'query',
            format: 'json',
            prop: 'extracts',
            exintro: '1',
            explaintext: '1',
            pageids: pageId,
            origin: '*'
        };

        const response = await fetch(`${this.baseUrl}?${new URLSearchParams(params)}`);
        const data = await response.json();
        return data.query.pages[pageId].extract;
    }

    async getArticleImages(title) {
        try {
            const params = {
                action: 'query',
                format: 'json',
                titles: title,
                prop: 'pageimages|images',
                piprop: 'original',
                imlimit: 5,
                origin: '*'
            };

            const response = await fetch(`${this.baseUrl}?${new URLSearchParams(params)}`);
            const data = await response.json();
            const pageId = Object.keys(data.query.pages)[0];
            const page = data.query.pages[pageId];
            
            let imageUrls = [];
            
            // Ana resmi ekle (varsa)
            if (page.original && page.original.source) {
                imageUrls.push(page.original.source);
            }
            
            // Diğer resimleri kontrol et
            if (page.images) {
                for (const image of page.images) {
                    if (imageUrls.length >= 3) break; // En fazla 3 resim
                    
                    // Resim adını kontrol et
                    const imageName = image.title.toLowerCase();
                    if (!this.isExcludedImage(imageName) && 
                        imageName.includes(title.toLowerCase()) && // Konu ile alakalı olmalı
                        !imageName.includes('logo') && 
                        !imageName.includes('icon')) {
                        
                        const imageInfo = await this.getImageInfo(image.title);
                        if (imageInfo) {
                            imageUrls.push(imageInfo);
                        }
                    }
                }
            }

            return imageUrls;
        } catch (error) {
            console.error('Görsel alma hatası:', error);
            return [];
        }
    }

    isExcludedImage(title) {
        const excludePatterns = [
            'logo', 'icon', 'symbol', 'question', 'medal', 'star', 'stub',
            'edit', 'ambox', 'disambig', 'wiki', 'commons', 'button',
            'map', 'diagram', 'graph', 'chart', 'banner', 'template',
            'footer', 'header', 'infobox', 'navigation'
        ];
        return excludePatterns.some(pattern => title.toLowerCase().includes(pattern));
    }

    async getImageInfo(title) {
        const params = {
            action: 'query',
            format: 'json',
            titles: title,
            prop: 'imageinfo',
            iiprop: 'url|size',
            origin: '*'
        };

        try {
            const response = await fetch(`${this.baseUrl}?${new URLSearchParams(params)}`);
            const data = await response.json();
            const page = Object.values(data.query.pages)[0];
            
            if (page.imageinfo && page.imageinfo[0].width >= 200) {
                return page.imageinfo[0].url;
            }
            return null;
        } catch {
            return null;
        }
    }

    addMessage(type, text, extras = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const content = document.createElement('div');
        content.className = 'message-content';

        // Mesaj başlığı
        const header = document.createElement('div');
        header.className = 'message-header';
        header.innerHTML = type === 'bot' ? 
            '<i class="fas fa-brain"></i> YILDIZ AI' :
            `<i class="fas fa-user"></i> ${this.currentUser}`;
        content.appendChild(header);

        // Ana içerik
        if (extras.title) {
            const title = document.createElement('h3');
            title.textContent = extras.title;
            content.appendChild(title);
        }

        // Wiki içerik wrapper
        if (text && extras.images && extras.images.length > 0) {
            const wikiContent = document.createElement('div');
            wikiContent.className = 'wiki-content';

            // Text bölümü
            const textDiv = document.createElement('div');
            textDiv.className = 'wiki-text';
            textDiv.textContent = text;
            wikiContent.appendChild(textDiv);

            // Görsel bölümü
            const imagesDiv = document.createElement('div');
            imagesDiv.className = 'wiki-images';

            extras.images.forEach(url => {
                const imageWrapper = document.createElement('div');
                imageWrapper.className = 'wiki-image';

                const img = document.createElement('img');
                img.src = url;
                img.alt = extras.title || 'Wikipedia görseli';
                img.loading = 'lazy';

                const actions = document.createElement('div');
                actions.className = 'image-actions';
                actions.innerHTML = `
                    <button class="image-action-btn" onclick="window.open('${url}', '_blank')">
                        <i class="fas fa-external-link-alt"></i> ${this.getTranslation('viewImage')}
                    </button>
                    <button class="image-action-btn" onclick="window.wikiAI.downloadImage('${url}', '${extras.title}')">
                        <i class="fas fa-download"></i> ${this.getTranslation('downloadImage')}
                    </button>
                `;

                imageWrapper.appendChild(img);
                imageWrapper.appendChild(actions);
                imagesDiv.appendChild(imageWrapper);
            });

            wikiContent.appendChild(imagesDiv);
            content.appendChild(wikiContent);
        } else {
            const textDiv = document.createElement('div');
            textDiv.className = 'wiki-text';
            textDiv.textContent = text;
            content.appendChild(textDiv);
        }

        if (extras.link) {
            const link = document.createElement('a');
            link.href = extras.link;
            link.target = '_blank';
            link.className = 'wiki-link';
            link.innerHTML = `<i class="fas fa-external-link-alt"></i> ${this.getTranslation('viewOnWiki')}`;
            content.appendChild(link);
        }

        messageDiv.appendChild(content);
        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
        this.saveChatToHistory();
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    async downloadImage(url, title) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const fileName = `${title || 'wikipedia'}_${Date.now()}.jpg`;
            
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showToast(this.getTranslation('downloadSuccess'));
        } catch (err) {
            console.error('İndirme hatası:', err);
            this.showToast(this.getTranslation('error'), 'error');
        }
    }

    startNewChat() {
        this.currentChatId = Date.now().toString();
        this.messages.innerHTML = '';
        this.chatTitle.value = this.getTranslation('newChat');
        this.chatContext.value = 'general';
        this.textarea.value = '';
        
        this.showWelcomeMessage();
        this.saveChatToHistory();
        this.updateChatList();
    }

    showWelcomeMessage() {
        this.addMessage('bot', this.getTranslation('welcome'));
    }

    clearChatHistory() {
        if (confirm(this.getTranslation('clearConfirm'))) {
            localStorage.removeItem('chats');
            this.startNewChat();
        }
    }

    saveChatToHistory() {
        const chat = {
            id: this.currentChatId,
            title: this.chatTitle.value || this.getTranslation('newChat'),
            context: this.chatContext.value,
            messages: Array.from(this.messages.children).map(msg => ({
                type: msg.classList.contains('user') ? 'user' : 'bot',
                content: msg.querySelector('.message-content').innerHTML
            })),
            timestamp: Date.now(),
            language: this.languageSelect.value
        };

        let chats = JSON.parse(localStorage.getItem('chats') || '[]');
        const existingIndex = chats.findIndex(c => c.id === chat.id);
        
        if (existingIndex !== -1) {
            chats[existingIndex] = chat;
        } else {
            chats.push(chat);
        }

        localStorage.setItem('chats', JSON.stringify(chats));
        this.updateChatList();
    }

    updateChatList() {
        this.chatList.innerHTML = '';
        const chats = JSON.parse(localStorage.getItem('chats') || '[]');
        
        chats.sort((a, b) => b.timestamp - a.timestamp)
            .forEach(chat => {
                const chatElement = document.createElement('div');
                chatElement.className = `chat-item${chat.id === this.currentChatId ? ' active' : ''}`;
                
                const chatContent = document.createElement('div');
                chatContent.className = 'chat-item-content';
                chatContent.innerHTML = `
                    <div class="chat-item-title">${chat.title}</div>
                    <div class="chat-item-info">
                        <span>${chat.context}</span>
                        <span>${new Date(chat.timestamp).toLocaleString()}</span>
                    </div>
                `;
                
                const actions = document.createElement('div');
                actions.className = 'chat-item-actions';
                actions.innerHTML = `
                    <button class="chat-action-btn edit" title="Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="chat-action-btn delete" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                
                // Event listeners
                actions.querySelector('.edit').onclick = (e) => {
                    e.stopPropagation();
                    this.editChatTitle(chat.id);
                };
                
                actions.querySelector('.delete').onclick = (e) => {
                    e.stopPropagation();
                    this.deleteChat(chat.id);
                };
                
                chatElement.appendChild(chatContent);
                chatElement.appendChild(actions);
                chatElement.onclick = () => this.loadChat(chat.id);
                
                this.chatList.appendChild(chatElement);
            });
    }

    editChatTitle(chatId) {
        const chats = JSON.parse(localStorage.getItem('chats') || '[]');
        const chat = chats.find(c => c.id === chatId);
        
        if (chat) {
            const newTitle = prompt(this.getTranslation('editChatTitle'), chat.title);
            if (newTitle && newTitle.trim()) {
                chat.title = newTitle.trim();
                localStorage.setItem('chats', JSON.stringify(chats));
                
                if (chatId === this.currentChatId) {
                    this.chatTitle.value = newTitle.trim();
                }
                
                this.updateChatList();
            }
        }
    }

    deleteChat(chatId) {
        if (confirm(this.getTranslation('deleteChatConfirm'))) {
            let chats = JSON.parse(localStorage.getItem('chats') || '[]');
            const filteredChats = chats.filter(c => c.id !== chatId);
            localStorage.setItem('chats', JSON.stringify(filteredChats));
            
            if (chatId === this.currentChatId) {
                if (filteredChats.length > 0) {
                    this.loadChat(filteredChats[0].id);
                } else {
                    this.startNewChat();
                }
            } else {
                this.updateChatList();
            }
        }
    }

    loadChat(chatId) {
        const chats = JSON.parse(localStorage.getItem('chats') || '[]');
        const chat = chats.find(c => c.id === chatId);
        
        if (chat) {
            this.currentChatId = chat.id;
            this.chatTitle.value = chat.title;
            this.chatContext.value = chat.context;
            this.languageSelect.value = chat.language || 'tr';
            
            this.messages.innerHTML = '';
            chat.messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.type}`;
                messageDiv.innerHTML = msg.content;
                this.messages.appendChild(messageDiv);
            });
            
            this.updateChatList();
        }
    }

    updateChatTitle() {
        this.saveChatToHistory();
    }

    updateChatContext() {
        this.saveChatToHistory();
    }
}

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    window.wikiAI = new WikipediaAI();
});