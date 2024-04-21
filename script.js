class Stack {
    constructor() {
        this.items = [];
    }

    // Returns if the stack is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // Push an element onto the stack
    push(element) {
        this.items.push(element);
    }

    // Pop the top element from the stack
    pop() {
        if (this.isEmpty()) {
            return null; // Stack is empty
        }
        return this.items.pop();
    }

    // Return the top element without removing it
    peek() {
        if (this.isEmpty()) {
            return null; // Stack is empty
        }
        return this.items[this.items.length - 1];
    }

    // Get the size of the stack
    size() {
        return this.items.length;
    }

    // Clear all elements from the stack
    clear() {
        this.items = [];
    }

    // Joins all of the items into one string
    join() {
        return (this.items).join('');
    }
}

let timerActive = false;

let playerID;

let player1Points = 0;
let player2Points  = 0;

let submitArray = [];

let wordList = document.getElementById('wordList');

const currentWordID = new Stack();
const currentWordContent = new Stack();

let gridCells = []; // Array to store references to all grid cells of player 1

const numRows = 4;
const numCols = 4;

let gameMode;

let timerInterval;
let seconds = 10;

let validWords = ["abandon", "ability", "able", "abortion", "about", "above", "abroad", "absence", "absolute", "absorb", "abuse", "academic", "accept", "access", "accident", "accompany", "according", "account", "accurate", "accuse", "achieve", "acid", "acquire", "across", "act", "action", "active", "activist", "activity", "actor", "actress", "actual", "actually", "adapt", "add", "addition", "address", "adequate", "adjust", "admire", "admission", "admit", "adopt", "adult", "advance", "advanced", "advantage", "adventure", "advice", "advise", "adviser", "advocate", "affair", "affect", "afford", "afraid", "African", "after", "afternoon", "again", "against", "age", "agency", "agenda", "agent", "ago", "agree", "agreement", "ahead", "aid", "aide", "AIDS", "aim", "air", "aircraft", "airline", "airport", "album", "alcohol", "alive", "all", "alliance", "allow", "ally", "almost", "alone", "along", "already", "also", "alter", "although", "always", "amazing", "American", "among", "amount", "analysis", "analyst", "analyze", "ancient", "and", "anger", "angle", "angry", "animal", "announce", "annual", "another", "answer", "anxiety", "any", "anybody", "anymore", "anyone", "anything", "anyway", "anywhere", "apart", "apartment", "apparent", "appeal", "appear", "apple", "apply", "appoint", "approach", "approval", "approve", "Arab", "architect", "area", "argue", "argument", "arise", "arm", "armed", "army", "around", "arrange", "arrest", "arrival", "arrive", "art", "article", "artist", "artistic", "Asian", "aside", "ask", "asleep", "aspect", "assault", "assert", "assess", "asset", "assign", "assist", "assistant", "associate", "assume", "assure", "athlete", "athletic", "attach", "attack", "attempt", "attend", "attention", "attitude", "attorney", "attract", "attribute", "audience", "author", "authority", "auto", "available", "average", "avoid", "award", "aware", "awareness", "away", "awful", "baby", "back", "bad", "badly", "bag", "bake", "balance", "ball", "ban", "band", "bank", "bar", "barely", "barrel", "barrier", "base", "baseball", "basic", "basically", "basis", "basket", "bathroom", "battery", "battle", "beach", "bean", "bear", "beat", "beautiful", "beauty", "because", "become", "bed", "bedroom", "beer", "before", "begin", "beginning", "behavior", "behind", "being", "belief", "believe", "bell", "belong", "below", "belt", "bench", "bend", "beneath", "benefit", "beside", "besides", "best", "bet", "better", "between", "beyond", "Bible", "big", "bike", "bill", "billion", "bind", "bird", "birth", "birthday", "bit", "bite", "black", "blade", "blame", "blanket", "blind", "block", "blood", "blow", "blue", "board", "boat", "body", "bomb", "bombing", "bond", "bone", "book", "boom", "boot", "border", "born", "borrow", "boss", "both", "bother", "bottle", "bottom", "boundary", "bowl", "box", "boy", "boyfriend", "brain", "branch", "brand", "bread", "break", "breakfast", "breast", "breath", "breathe", "brick", "bridge", "brief", "briefly", "bright", "brilliant", "bring", "British", "broad", "broken", "brother", "brown", "brush", "buck", "budget", "build", "building", "bullet", "bunch", "burden", "burn", "bury", "bus", "business", "busy", "but", "butter", "button", "buy", "buyer", "cabin", "cabinet", "cable", "cake", "calculate", "call", "camera", "camp", "campaign", "campus", "can", "Canadian", "cancer", "candidate", "cap", "capable", "capacity", "capital", "captain", "capture", "car", "carbon", "card", "care", "career", "careful", "carefully", "carrier", "carry", "case", "cash", "cast", "cat", "catch", "category", "Catholic", "cause", "ceiling", "celebrate", "celebrity", "cell", "center", "central", "century", "CEO", "ceremony", "certain", "certainly", "chain", "chair", "chairman", "challenge", "chamber", "champion", "chance", "change", "changing", "channel", "chapter", "character", "charge", "charity", "chart", "chase", "cheap", "check", "cheek", "cheese", "chef", "chemical", "chest", "chicken", "chief", "child", "childhood", "Chinese", "chip", "chocolate", "choice", "choose", "Christian", "Christmas", "church", "cigarette", "circle", "cite", "citizen", "city", "civil", "civilian", "claim", "class", "classic", "classroom", "clean", "clear", "clearly", "client", "climate", "climb", "clinic", "clinical", "clock", "close", "closely", "closer", "clothes", "clothing", "cloud", "club", "clue", "cluster", "coach", "coal", "coalition", "coast", "coat", "code", "coffee", "cognitive", "cold", "collapse", "colleague", "collect", "college", "colonial", "color", "column", "combine", "come", "comedy", "comfort", "command", "commander", "comment", "commit", "committee", "common", "community", "company", "compare", "compete", "complain", "complaint", "complete", "complex", "component", "compose", "computer", "concept", "concern", "concerned", "concert", "conclude", "concrete", "condition", "conduct", "confident", "confirm", "conflict", "confront", "confusion", "Congress", "connect", "consensus", "consider", "consist", "constant", "construct", "consume", "consumer", "contact", "contain", "container", "content", "contest", "context", "continue", "continued", "contract", "contrast", "control", "convert", "convince", "cook", "cookie", "cooking", "cool", "cop", "cope", "copy", "core", "corn", "corner", "corporate", "correct", "cost", "cotton", "couch", "could", "council", "counselor", "count", "counter", "country", "county", "couple", "courage", "course", "court", "cousin", "cover", "coverage", "cow", "crack", "craft", "crash", "crazy", "cream", "create", "creation", "creative", "creature", "credit", "crew", "crime", "criminal", "crisis", "criteria", "critic", "critical", "criticism", "criticize", "crop", "cross", "crowd", "crucial", "cry", "cultural", "culture", "cup", "curious", "current", "currently", "custom", "customer", "cut", "cycle", "dad", "daily", "damage", "dance", "danger", "dangerous", "dare", "dark", "darkness", "data", "date", "daughter", "day", "dead", "deal", "dealer", "dear", "death", "debate", "debt", "decade", "decide", "decision", "deck", "declare", "decline", "decrease", "deep", "deeply", "deer", "defeat", "defend", "defendant", "defense", "defensive", "deficit", "define", "degree", "delay", "deliver", "delivery", "demand", "democracy", "Democrat", "deny", "depend", "dependent", "depending", "depict", "depth", "deputy", "derive", "describe", "desert", "deserve", "design", "designer", "desire", "desk", "desperate", "despite", "destroy", "detail", "detailed", "detect", "determine", "develop", "device", "devote", "dialogue", "die", "diet", "differ", "different", "difficult", "dig", "digital", "dimension", "dining", "dinner", "direct", "direction", "directly", "director", "dirt", "dirty", "disagree", "disappear", "disaster", "discourse", "discover", "discovery", "discuss", "disease", "dish", "dismiss", "disorder", "display", "dispute", "distance", "distant", "distinct", "district", "diverse", "diversity", "divide", "division", "divorce", "DNA", "doctor", "document", "dog", "domestic", "dominant", "dominate", "door", "double", "doubt", "down", "downtown", "dozen", "draft", "drag", "drama", "dramatic", "draw", "drawing", "dream", "dress", "drink", "drive", "driver", "drop", "drug", "dry", "due", "during", "dust", "duty", "each", "eager", "ear", "early", "earn", "earnings", "earth", "ease", "easily", "east", "eastern", "easy", "eat", "economic", "economics", "economist", "economy", "edge", "edition", "editor", "educate", "education", "educator", "effect", "effective", "efficient", "effort", "egg", "eight", "either", "elderly", "elect", "election", "electric", "element", "eliminate", "elite", "else", "elsewhere", "embrace", "emerge", "emergency", "emission", "emotion", "emotional", "emphasis", "emphasize", "employ", "employee", "employer", "empty", "enable", "encounter", "encourage", "end", "enemy", "energy", "engage", "engine", "engineer", "English", "enhance", "enjoy", "enormous", "enough", "ensure", "enter", "entire", "entirely", "entrance", "entry", "episode", "equal", "equally", "equipment", "era", "error", "escape", "essay", "essential", "establish", "estate", "estimate", "etc", "ethics", "ethnic", "European", "evaluate", "even", "evening", "event", "ever", "every", "everybody", "everyday", "everyone", "evidence", "evolution", "evolve", "exact", "exactly", "examine", "example", "exceed", "excellent", "except", "exception", "exchange", "exciting", "executive", "exercise", "exhibit", "exist", "existence", "existing", "expand", "expansion", "expect", "expense", "expensive", "expert", "explain", "explode", "explore", "explosion", "expose", "exposure", "express", "extend", "extension", "extensive", "extent", "external", "extra", "extreme", "extremely", "eye", "fabric", "face", "facility", "fact", "factor", "factory", "faculty", "fade", "fail", "failure", "fair", "fairly", "faith", "fall", "false", "familiar", "family", "famous", "fan", "fantasy", "far", "farm", "farmer", "fashion", "fast", "fat", "fate", "father", "fault", "favor", "favorite", "fear", "feature", "federal", "fee", "feed", "feel", "feeling", "fellow", "female", "fence", "few", "fewer", "fiber", "fiction", "field", "fifteen", "fifth", "fifty", "fight", "fighter", "fighting", "figure", "file", "fill", "film", "final", "finally", "finance", "financial", "find", "finding", "fine", "finger", "finish", "fire", "firm", "first", "fish", "fishing", "fit", "fitness", "five", "fix", "flag", "flame", "flat", "flavor", "flee", "flesh", "flight", "float", "floor", "flow", "flower", "fly", "focus", "folk", "follow", "following", "food", "foot", "football", "for", "force", "foreign", "forest", "forever", "forget", "form", "formal", "formation", "former", "formula", "forth", "fortune", "forward", "found", "founder", "four", "fourth", "frame", "framework", "free", "freedom", "freeze", "French", "frequency", "frequent", "fresh", "friend", "friendly", "from", "front", "fruit", "fuel", "full", "fully", "fun", "function", "fund", "funding", "funeral", "funny", "furniture", "future", "gain", "galaxy", "gallery", "game", "gang", "gap", "garage", "garden", "garlic", "gas", "gate", "gather", "gay", "gaze", "gear", "gender", "gene", "general", "generally", "generate", "genetic", "gentleman", "gently", "German", "gesture", "get", "ghost", "giant", "gift", "gifted", "girl", "give", "given", "glad", "glance", "glass", "global", "glove", "goal", "God", "gold", "golden", "golf", "good", "governor", "grab", "grade", "gradually", "graduate", "grain", "grand", "grant", "grass", "grave", "gray", "great", "greatest", "green", "grocery", "ground", "group", "grow", "growing", "growth", "guarantee", "guard", "guess", "guest", "guide", "guideline", "guilty", "gun", "guy", "habit", "habitat", "hair", "half", "hall", "hand", "handful", "handle", "hang", "happen", "happy", "hard", "hardly", "hat", "hate", "have", "head", "headline", "health", "healthy", "hear", "hearing", "heart", "heat", "heaven", "heavily", "heavy", "heel", "height", "hell", "hello", "help", "helpful", "her", "here", "heritage", "hero", "herself", "hey", "hide", "high", "highlight", "highly", "highway", "hill", "him", "himself", "hip", "hire", "his", "historian", "historic", "history", "hit", "hold", "hole", "holiday", "holy", "home", "homeless", "honest", "honey", "honor", "hope", "horizon", "horror", "horse", "hospital", "host", "hot", "hotel", "hour", "house", "household", "housing", "how", "however", "huge", "human", "humor", "hundred", "hungry", "hunter", "hunting", "hurt", "husband", "ice", "idea", "ideal", "identify", "identity", "ignore", "ill", "illegal", "illness", "image", "imagine", "immediate", "immigrant", "impact", "implement", "imply", "important", "impose", "impress", "improve", "incentive", "incident", "include", "including", "income", "increase", "increased", "indeed", "index", "Indian", "indicate", "industry", "infant", "infection", "inflation", "influence", "inform", "initial", "initially", "injury", "inner", "innocent", "inquiry", "inside", "insight", "insist", "inspire", "install", "instance", "instead", "insurance", "intend", "intense", "intensity", "intention", "interest", "internal", "Internet", "interpret", "interview", "into", "introduce", "invasion", "invest", "investor", "invite", "involve", "involved", "Iraqi", "Irish", "iron", "Islamic", "island", "Israeli", "issue", "Italian", "item", "its", "itself", "jacket", "jail", "Japanese", "jet", "Jew", "Jewish", "job", "join", "joint", "joke", "journal", "journey", "joy", "judge", "judgment", "juice", "jump", "junior", "jury", "just", "justice", "justify", "keep", "key", "kick", "kid", "kill", "killer", "killing", "kind", "king", "kiss", "kitchen", "knee", "knife", "knock", "know", "knowledge", "lab", "label", "labor", "lack", "lady", "lake", "land", "landscape", "language", "lap", "large", "largely", "last", "late", "later", "Latin", "latter", "laugh", "launch", "law", "lawn", "lawsuit", "lawyer", "lay", "layer", "lead", "leader", "leading", "leaf", "league", "lean", "learn", "learning", "least", "leather", "leave", "left", "leg", "legacy", "legal", "legend", "lemon", "length", "less", "lesson", "let", "letter", "level", "liberal", "library", "license", "lie", "life", "lifestyle", "lifetime", "lift", "light", "like", "likely", "limit", "limited", "line", "link", "lip", "list", "listen", "literally", "literary", "little", "live", "living", "load", "loan", "local", "locate", "location", "lock", "long", "look", "loose", "lose", "loss", "lost", "lot", "lots", "loud", "love", "lovely", "lover", "low", "lower", "luck", "lucky", "lunch", "lung", "machine", "mad", "magazine", "mail", "main", "mainly", "maintain", "major", "majority", "make", "maker", "makeup", "male", "mall", "man", "manage", "manager", "manner", "many", "map", "margin", "mark", "market", "marketing", "marriage", "married", "marry", "mask", "mass", "massive", "master", "match", "material", "math", "matter", "may", "maybe", "mayor", "meal", "mean", "meaning", "meanwhile", "measure", "meat", "mechanism", "media", "medical", "medicine", "medium", "meet", "meeting", "member", "memory", "mental", "mention", "menu", "mere", "merely", "mess", "message", "metal", "meter", "method", "Mexican", "middle", "might", "military", "milk", "million", "mind", "mine", "minister", "minor", "minority", "minute", "miracle", "mirror", "miss", "missile", "mission", "mistake", "mix", "mixture", "mode", "model", "moderate", "modern", "modest", "mom", "moment", "money", "monitor", "month", "mood", "moon", "moral", "more", "moreover", "morning", "mortgage", "most", "mostly", "mother", "motion", "motor", "mount", "mountain", "mouse", "mouth", "move", "movement", "movie", "Mrs", "much", "multiple", "murder", "muscle", "museum", "music", "musical", "musician", "Muslim", "must", "mutual", "myself", "mystery", "myth", "naked", "name", "narrative", "narrow", "nation", "national", "native", "natural", "naturally", "nature", "near", "nearby", "nearly", "necessary", "neck", "need", "negative", "negotiate", "neighbor", "neither", "nerve", "nervous", "net", "network", "never", "new", "newly", "news", "newspaper", "next", "nice", "night", "nine", "nobody", "nod", "noise", "none", "nor", "normal", "normally", "north", "northern", "nose", "not", "note", "nothing", "notice", "notion", "novel", "now", "nowhere", "nuclear", "number", "numerous", "nurse", "nut", "object", "objective", "observe", "observer", "obtain", "obvious", "obviously", "occasion", "occupy", "occur", "ocean", "odd", "odds", "off", "offense", "offensive", "offer", "office", "officer", "official", "often", "oil", "okay", "old", "Olympic", "once", "one", "ongoing", "onion", "online", "only", "onto", "open", "opening", "operate", "operating", "operation", "operator", "opinion", "opponent", "oppose", "opposite", "option", "orange", "order", "ordinary", "organic", "organize", "origin", "original", "other", "others", "otherwise", "ought", "our", "ourselves", "out", "outcome", "outside", "oven", "over", "overall", "overcome", "overlook", "owe", "own", "owner", "pace", "pack", "package", "page", "pain", "painful", "paint", "painter", "painting", "pair", "pale", "palm", "pan", "panel", "pant", "paper", "parent", "park", "parking", "part", "partly", "partner", "party", "pass", "passage", "passenger", "passion", "past", "patch", "path", "patient", "pattern", "pause", "pay", "payment", "peace", "peak", "peer", "penalty", "people", "pepper", "per", "perceive", "perfect", "perfectly", "perform", "perhaps", "period", "permanent", "permit", "person", "personal", "personnel", "persuade", "pet", "phase", "phone", "photo", "phrase", "physical", "physician", "piano", "pick", "picture", "pie", "piece", "pile", "pilot", "pine", "pink", "pipe", "pitch", "place", "plan", "plane", "planet", "planning", "plant", "plastic", "plate", "platform", "play", "player", "please", "pleasure", "plenty", "plot", "plus", "pocket", "poem", "poet", "poetry", "point", "pole", "police", "policy", "political", "politics", "poll", "pollution", "pool", "poor", "pop", "popular", "porch", "port", "portion", "portrait", "portray", "pose", "position", "positive", "possess", "possible", "possibly", "post", "pot", "potato", "potential", "pound", "pour", "poverty", "powder", "power", "powerful", "practical", "practice", "pray", "prayer", "precisely", "predict", "prefer", "pregnancy", "pregnant", "prepare", "presence", "present", "preserve", "president", "press", "pressure", "pretend", "pretty", "prevent", "previous", "price", "pride", "priest", "primarily", "primary", "prime", "principal", "principle", "print", "prior", "priority", "prison", "prisoner", "privacy", "private", "probably", "problem", "procedure", "proceed", "process", "produce", "producer", "product", "professor", "profile", "profit", "program", "progress", "project", "prominent", "promise", "promote", "prompt", "proof", "proper", "properly", "property", "proposal", "propose", "proposed", "prospect", "protect", "protein", "protest", "proud", "prove", "provide", "provider", "province", "provision", "public", "publicly", "publish", "publisher", "pull", "purchase", "pure", "purpose", "pursue", "push", "put", "qualify", "quality", "quarter", "question", "quick", "quickly", "quiet", "quietly", "quit", "quite", "quote", "race", "racial", "radical", "radio", "rail", "rain", "raise", "range", "rank", "rapid", "rapidly", "rare", "rarely", "rate", "rather", "rating", "ratio", "raw", "reach", "react", "reaction", "read", "reader", "reading", "ready", "real", "reality", "realize", "really", "reason", "recall", "receive", "recent", "recently", "recipe", "recognize", "recommend", "record", "recording", "recover", "recovery", "recruit", "red", "reduce", "reduction", "refer", "reference", "reflect", "reform", "refugee", "refuse", "regard", "regarding", "regime", "region", "regional", "register", "regular", "regularly", "regulate", "reinforce", "reject", "relate", "relation", "relative", "relax", "release", "relevant", "relief", "religion", "religious", "rely", "remain", "remaining", "remember", "remind", "remote", "remove", "repeat", "replace", "reply", "report", "reporter", "represent", "request", "require", "research", "resemble", "resident", "resist", "resolve", "resort", "resource", "respect", "respond", "response", "rest", "restore", "result", "retain", "retire", "return", "reveal", "revenue", "review", "rhythm", "rice", "rich", "rid", "ride", "rifle", "right", "ring", "rise", "risk", "river", "road", "rock", "role", "roll", "romantic", "roof", "room", "root", "rope", "rose", "rough", "roughly", "round", "route", "routine", "row", "rub", "rule", "run", "running", "rural", "rush", "Russian", "sacred", "sad", "safe", "safety", "sake", "salad", "salary", "sale", "sales", "salt", "same", "sample", "sanction", "sand", "satellite", "satisfy", "sauce", "save", "saving", "say", "scale", "scandal", "scared", "scenario", "scene", "schedule", "scheme", "scholar", "school", "science", "scientist", "scope", "score", "scream", "screen", "script", "sea", "search", "season", "seat", "second", "secret", "secretary", "section", "sector", "secure", "security", "see", "seed", "seek", "seem", "segment", "seize", "select", "selection", "self", "sell", "Senate", "senator", "send", "senior", "sense", "sensitive", "sentence", "separate", "sequence", "series", "serious", "seriously", "serve", "service", "session", "set", "setting", "settle", "seven", "several", "severe", "sex", "sexual", "shade", "shadow", "shake", "shall", "shape", "share", "sharp", "she", "sheet", "shelf", "shell", "shelter", "shift", "shine", "ship", "shirt", "shit", "shock", "shoe", "shoot", "shooting", "shop", "shopping", "shore", "short", "shortly", "shot", "should", "shoulder", "shout", "show", "shower", "shrug", "shut", "sick", "side", "sigh", "sight", "sign", "signal", "silence", "silent", "silver", "similar", "similarly", "simple", "simply", "sin", "since", "sing", "singer", "single", "sink", "sir", "sister", "sit", "site", "situation", "six", "size", "ski", "skill", "skin", "sky", "slave", "sleep", "slice", "slide", "slight", "slightly", "slip", "slow", "slowly", "small", "smart", "smell", "smile", "smoke", "smooth", "snap", "snow", "soccer", "social", "society", "soft", "software", "soil", "solar", "soldier", "solid", "solution", "solve", "some", "somebody", "somehow", "someone", "something", "sometimes", "somewhat", "somewhere", "son", "song", "soon", "sorry", "sort", "soul", "sound", "soup", "source", "south", "southern", "Soviet", "space", "Spanish", "speak", "speaker", "special", "species", "specific", "speech", "speed", "spend", "spending", "spin", "spirit", "spiritual", "split", "spokesman", "sport", "spot", "spread", "spring", "square", "squeeze", "stability", "stable", "staff", "stage", "stair", "stake", "stand", "standard", "standing", "star", "stare", "start", "state", "statement", "station", "status", "stay", "steady", "steal", "steel", "step", "stick", "still", "stir", "stock", "stomach", "stone", "stop", "storage", "store", "storm", "story", "straight", "strange", "stranger", "strategic", "strategy", "stream", "street", "strength", "stress", "stretch", "strike", "string", "strip", "stroke", "strong", "strongly", "structure", "struggle", "student", "studio", "study", "stuff", "stupid", "style", "subject", "submit", "substance", "succeed", "success", "such", "sudden", "suddenly", "sue", "suffer", "sugar", "suggest", "suicide", "suit", "summer", "summit", "sun", "super", "supply", "support", "supporter", "suppose", "supposed", "Supreme", "sure", "surely", "surface", "surgery", "surprise", "surprised", "surround", "survey", "survival", "survive", "survivor", "suspect", "sustain", "swear", "sweep", "sweet", "swim", "swing", "switch", "symbol", "symptom", "system", "table", "tactic", "tail", "take", "tale", "talent", "talk", "tall", "tank", "tap", "tape", "target", "task", "taste", "tax", "taxpayer", "tea", "teach", "teacher", "teaching", "team", "tear", "teaspoon", "technical", "technique", "teen", "teenager", "telephone", "telescope", "tell", "temporary", "ten", "tend", "tendency", "tennis", "tension", "tent", "term", "terms", "terrible", "territory", "terror", "terrorism", "terrorist", "test", "testify", "testimony", "testing", "text", "than", "thank", "thanks", "that", "the", "theater", "their", "them", "theme", "then", "theory", "therapy", "there", "therefore", "these", "they", "thick", "thin", "thing", "think", "thinking", "third", "thirty", "this", "those", "though", "thought", "thousand", "threat", "threaten", "three", "throat", "through", "throw", "thus", "ticket", "tie", "tight", "time", "tiny", "tip", "tire", "tired", "tissue", "title", "tobacco", "today", "toe", "together", "tomato", "tomorrow", "tone", "tongue", "tonight", "too", "tool", "tooth", "top", "topic", "toss", "total", "totally", "touch", "tough", "tour", "tourist", "toward", "towards", "tower", "town", "toy", "trace", "track", "trade", "tradition", "traffic", "tragedy", "trail", "train", "training", "transfer", "transform", "translate", "travel", "treat", "treatment", "treaty", "tree", "trend", "trial", "tribe", "trick", "trip", "troop", "trouble", "truck", "true", "truly", "trust", "truth", "try", "tube", "tunnel", "turn", "twelve", "twenty", "twice", "twin", "two", "type", "typical", "typically", "ugly", "ultimate", "unable", "uncle", "under", "undergo", "uniform", "union", "unique", "unit", "United", "universal", "universe", "unknown", "unless", "unlike", "unlikely", "until", "unusual", "upon", "upper", "urban", "urge", "use", "used", "useful", "user", "usual", "usually", "utility", "vacation", "valley", "valuable", "value", "variable", "variation", "variety", "various", "vary", "vast", "vegetable", "vehicle", "venture", "version", "versus", "very", "vessel", "veteran", "via", "victim", "victory", "video", "view", "viewer", "village", "violate", "violation", "violence", "violent", "virtually", "virtue", "virus", "visible", "vision", "visit", "visitor", "visual", "vital", "voice", "volume", "volunteer", "vote", "voter", "wage", "wait", "wake", "walk", "wall", "wander", "want", "war", "warm", "warn", "warning", "wash", "waste", "watch", "water", "wave", "way", "weak", "wealth", "wealthy", "weapon", "wear", "weather", "wedding", "week", "weekend", "weekly", "weigh", "weight", "welcome", "welfare", "well", "west", "western", "wet", "what", "whatever", "wheel", "when", "whenever", "where", "whereas", "whether", "which", "while", "whisper", "white", "who", "whole", "whom", "whose", "why", "wide", "widely", "wife", "wild", "will", "willing", "win", "wind", "window", "wine", "wing", "winner", "winter", "wipe", "wire", "wisdom", "wise", "wish", "with", "withdraw", "within", "without", "witness", "woman", "wonder", "wonderful", "wood", "wooden", "word", "work", "worker", "working", "works", "workshop", "world", "worried", "worry", "worth", "would", "wound", "wrap", "write", "writer", "writing", "wrong", "yard", "yeah", "year", "yell", "yellow", "yes", "yesterday", "yet", "yield", "you", "young", "your", "yours", "yourself", "youth", "zone", "zambia", "zdnet", "zealand", "zen", "zero", "zimbabwe", "zinc", "zip", "zoloft", "zones", "zoning", "zoo", "zoom", "zoophilia", "zope", "zshops", "zum", "zus"];
console.log(validWords);
function generateBoggleBoard(initial) {
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

    //This const was gotten from chat gpt for letter distribution.
    const letterDistribution = [...vowels,...vowels, ...vowels, ...vowels, ...consonants, ...consonants, ...consonants, ...consonants, ...consonants]; // Vowels:Consonants in a 4:5 Ratio

    const board = [];

    // Loop through each row
    if (initial === true){
        for (let i = 0; i < numRows; i++) {
            const row = [];

            // Loop through each column in the current row
            for (let j = 0; j < numCols; j++) {
                // Generate a random index to select a letter from the distribution
                const randomIndex = Math.floor(Math.random() * letterDistribution.length);
                const randomLetter = letterDistribution[randomIndex];
                row.push(randomLetter); // Push the random letter to the current row
            }

            board.push(row); // Push the row to the 2D array (board)
        }
    } else {
        for (let i = 0; i < numRows; i++) {
            const row = [];

            // Loop through each column in the current row
            for (let j = 0; j < numCols; j++) {
                row.push(""); // Push empty string
            }

            board.push(row); // Push the row to the 2D array (board)
        }
    }
    createGrid(board, "grid")
}

// Function to create the grid from the letters list
function createGrid(letters, gridID) {
    const grid = document.getElementById(gridID);

    // Clear existing content
    grid.innerHTML = '';
    gridCells = []; // Reset gridCells array

    // Loop through each row in the letters list
    letters.forEach((rowData, rowIndex) => {
        const row = document.createElement('tr');

        // Loop through each letter in the row
        rowData.forEach((letter, colIndex) => {
            const cell = document.createElement('td');
            const cellContent = document.createElement('div'); // Create a <div> for cell content, acessible through cell.querySelector('div')
            cellContent.textContent = letter; // Set the text content of the <div>

            // Add styles to the cell content <div>
            cellContent.style.width = '100%';
            cellContent.style.height = '100%';
            cellContent.style.display = 'flex';
            cellContent.style.alignItems = 'center';
            cellContent.style.justifyContent = 'center';
            cellContent.style.backgroundColor = "#E6E6FA";

            // Assign a unique ID to each cell based on its position
            const cellId = `cell-${rowIndex}-${colIndex}`;
            cell.setAttribute('id', cellId);
            cell.setAttribute('data-gridID', gridID);
            cell.setAttribute('data-on', false);
            cell.setAttribute('data-x', colIndex);
            cell.setAttribute('data-y', rowIndex);

            // Click listener
            cell.addEventListener('click', () => {
                const cellContent = cell.querySelector('div');
                    if (cell.getAttribute('data-on') !== 'true' && isAdjacent(cell) && timerActive) {
                        cellContent.style.backgroundColor = "#00CED1";
                        cell.setAttribute('data-on', 'true');

                        currentWordID.push(cell);
                        currentWordContent.push(cellContent.textContent);

                        document.getElementById("currentWord").textContent = ("Current Word: "+currentWordContent.join());
                    } else if (cell.getAttribute('data-on') === 'true' && cell.id === currentWordID.peek().id && timerActive) {
                        cell.setAttribute('data-on', 'false');
                        cellContent.style.backgroundColor = "#E6E6FA";

                        currentWordID.pop();
                        currentWordContent.pop();

                        document.getElementById("currentWord").textContent = ("Current Word: "+currentWordContent.join());
                    }
            });

            cell.appendChild(cellContent); // Append the <div> to the cell
            row.appendChild(cell); // Append the cell to the row

            // Store reference to the cell in gridCells array
                if (!gridCells[rowIndex]) {
                    gridCells[rowIndex] = [];
                }
                gridCells[rowIndex][colIndex] = cell;
        });

        grid.appendChild(row); // Append the row to the table
    });
}

// fix post stack implimentation
function submitWord(gridID) {
    let word = currentWordContent.join();

    if (currentWordID.size() > 2){
        if (wordValidation(word, gridID)){
            //Get current players id, update appropriate score, reset board state.
            if (playerId = '01'){
                player1Points += calculateScore(word);
                document.querySelectorAll('.player1Score').forEach(element => {
                    if (gameMode === "singlePlayer"){
                        element.textContent = "Score: ".concat(player1Points);
                        console.log(gameMode);
                    }
                    else if (gameMode === "twoPlayer") {
                        element.textContent = "Player 1's Score: ".concat(player1Points);
                    }
                });
            } else {
                player2Points += calculateScore(word);
                document.querySelectorAll('.player2Score').forEach(element => {
                if (gameMode === "twoPlayer")
                    element.textContent = "Player 2's Score: ".concat(player2Points);
                else if (gameMode === "playerVsAI") {
                    element.textContent = "Computer's Score: ".concat(player2Points);
                }
                });
            }

            // Add valid submitted word to word list.
            const listItem = document.createElement('li');
            listItem.textContent = word;
            wordList.appendChild(listItem);

            // Clear the submitArray
            currentWordID.clear();
            currentWordContent.clear();

            // Reset text box
            document.getElementById("currentWord").textContent = "Current Word: ";

            // Reset background color of all cells of the given player grid
            gridCells.forEach(row => {
                row.forEach(cell => {
                    const cellContent = cell.querySelector('div');
                    cellContent.style.backgroundColor = "#E6E6FA";
                    cell.setAttribute('data-on', false);
                });
            });
        } else {
            console.log("Failed to submit");
        alert("Word is not valid: failed to submit");
        }
    } else {
        console.log("Failed to submit");
        alert("Word is too short: failed to submit");
    }
}

function wordValidation(word) {
  return validWords.includes(word);
}

// Call after validity check called on word submit
function calculateScore(word) {
    const length = word.length;

    if (length >= 3 && length <= 4) {
        return 1;
    } else if (length === 5) {
        return 2;
    } else if (length === 6) {
        return 3;
    } else if (length === 7) {
        return 5;
    } else if (length >= 8) {
        return 11;
    } else {
        return 0; // Not in scoring range & should be unreachable
    }
}

function isAdjacent(cell){
    //If current word is empty any cell is able to be clicked
    if (currentWordID.isEmpty()){
        return true;
    }

    const x = parseInt(cell.getAttribute('data-x'));
    const y = parseInt(cell.getAttribute('data-y'));

    const lastCell = currentWordID.peek();
    const lastX = parseInt(lastCell.getAttribute('data-x'));
    const lastY = parseInt(lastCell.getAttribute('data-y'));

    // Check if the clicked cell is adjacent to the last clicked cell
    if (Math.abs(x - lastX) <= 1 && Math.abs(y - lastY) <= 1) {
        return true;
    } else {
        return false;
    }
}

function startTimer(){
    //Closes popup (should only matter at turn end and start of a new game after another just finished)
    const dialog = document.getElementById("turnEndDialog");
    dialog.close();
    //Cells should not be clickable when timer is not active, set to false by default
    timerActive = true;
    timer = seconds;

    timerInterval = setInterval(updateTimer, 10000) //Updates timer ever 1000 miliseconds
}

function updateTimer() {
    document.getElementById("timer").textContent = "Seconds Remaing: "+timer;
    timer = timer - 1;

    if (timer <= 0){
        clearInterval(timerInterval);
        document.getElementById("timer").textContent = "Seconds Remaing: "+timer;
        timer = seconds;
        timerActive = false;

        //Since playerID changes at turn end this check allows me to see if it is the first or second turn of a game instance.
        if (playerID === "01"){
            showTurnEnd();
        } else {
            showGameEnd();
        }
    }
}

function showTurnEnd() {
    if (gameMode === "twoPlayer"){
        document.getElementById("endOfTurnText").textContent = "End of Player 1's Turn";
        document.getElementById("endOfTurnScore").textContent = "Score: "+player1Points;
        document.getElementById("endOfTurnButton").textContent = "Player 2's Turn";
        const turnDialog = document.getElementById("turnEndDialog");
        turnDialog.showModal();
        playerID = "02";
    } else if (gameMode === "playerVsAI"){
        document.getElementById("endOfTurnText").textContent = "End of Player's Turn"
        document.getElementById("endOfTurnScore").textContent = "Score: "+player1Points;
        document.getElementById("endOfTurnButton").textContent = "Computer's Turn";
        const turnDialog = document.getElementById("turnEndDialog");
        turnDialog.showModal();
        playerID = "Computer";
    } else {
        showGameEnd();
    }
}

function showGameEnd(){
    if (gameMode === "twoPlayer"){
        document.getElementById("endOfGameText").textContent = (player1Points === player2Points) ? "Its a tie!" : (player1Points > player2Points) ? "Player 1 Wins!" : "Player 2 Wins!";
        document.getElementById("endOfGameScore").textContent = "Scores: "+player1Points+" : "+player2Points;
    } else if (gameMode === "playerVsAI"){
        document.getElementById("endOfGameText").textContent = (player1Points === player2Points) ? "Its a tie!" : (player1Points > player2Points) ? "Player Wins!" : "Computer Wins!";
        document.getElementById("endOfGameScore").textContent = "Scores: "+player1Points+" : "+player2Points;
    } else {
        document.getElementById("endOfGameScore").textContent = "Score: "+player1Points;
    }
    const endDialog = document.getElementById("gameEndDialog");
    endDialog.showModal();
}

function resetTextBoxes(){
    document.getElementById("gridAndWordContainer").style.marginTop = "2.5%";

    document.getElementById("singlePlayerScore").textContent = "Score: ";
    document.getElementById("player1").textContent = "Player 1's Score: ";
    document.getElementById("player2").textContent = "Player 2's Score: ";
    document.getElementById("AIScore").textContent = "Computer's Score: ";
    document.getElementById("currentWord").textContent = "Current Word: ";
    document.getElementById("wordList").textContent = "";

    document.getElementById("singlePlayerScore").style.display = "";
    document.getElementById("player1").style.display = "";
    document.getElementById("player2").style.display = "";
    document.getElementById("AIScore").style.display = "";
    document.getElementById("currentWord").style.display = "";
    document.getElementById("wordList").style.display = "";
}

function blockAllScoreBoxes() {
    document.getElementById("gridAndWordContainer").style.marginTop = "5%";
    document.getElementById("singlePlayerScore").style.display = "none";
    document.getElementById("player1").style.display = "none";
    document.getElementById("player2").style.display = "none";
    document.getElementById("AIScore").style.display = "none";
}

function setGameMode(gm) {
    gameMode = gm;
    if (gameMode === "twoPlayer") {
        // Start turn of player 1 after click input, show both score items, show turn end overlay, start player 2 turn, and dispaly score overlay at the end of the time.
        console.log("Player Vs. Player");
        document.getElementById("singlePlayerScore").style.display = "none";
        document.getElementById("AIScore").style.display = "none";

        playerID = "01";
        startTimer();
    } else if (gameMode === "playerVsAI") {
        // Start turn of player 1 after click input, show both score items, show turn end overlay, start AI Player turn.
        console.log("Player Vs. AI");
        document.getElementById("singlePlayerScore").style.display = "none";
        document.getElementById("player2").style.display = "none";

        playerID = "01";
        startTimer();
    } else {
        // Start the timer and only display one player score item, dispaly score over lay at the end of timer
        console.log("Single Player");
        document.getElementById("player1").style.display = "none";
        document.getElementById("player2").style.display = "none";
        document.getElementById("AIScore").style.display = "none";

        playerID = "01";
        startTimer();
    }
}

blockAllScoreBoxes();
generateBoggleBoard(false);

function startGame() {
    document.getElementById("turnEndDialog").close();
    document.getElementById("gameEndDialog").close();
    clearInterval(timerInterval);
    resetTextBoxes();
    generateBoggleBoard(true);
    setGameMode(document.getElementById("gameModeSelector").value);
}

function stopGame() {
    document.getElementById("turnEndDialog").close();
    document.getElementById("gameEndDialog").close();
    document.getElementById("timer").textContent = "Seconds Remaining: ";
    clearInterval(timerInterval);
    resetTextBoxes();
    blockAllScoreBoxes();
    generateBoggleBoard(false);
}
