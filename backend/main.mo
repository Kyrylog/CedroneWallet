import OrderedMap "mo:base/OrderedMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import OutCall "http-outcalls/outcall";
import Char "mo:base/Char";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";



actor {
  transient let textMap = OrderedMap.Make<Text>(Text.compare);
  transient let charMap = OrderedMap.Make<Char>(Char.compare);

  var priceCache : OrderedMap.Map<Text, (Text, Int)> = textMap.empty();
  var networkPrefs : OrderedMap.Map<Text, Text> = textMap.empty();
  var bip39Words : [Text] = [];
  var mnemonicWords : [Text] = [];

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public func fetchAptPrice() : async Text {
    let url = "https://api.binance.com/api/v3/ticker/price?symbol=APTUSDT";
    let response = await OutCall.httpGetRequest(url, [], transform);
    let timestamp = Time.now();
    priceCache := textMap.put(priceCache, "APTUSDT", (response, timestamp));
    response;
  };

  public func getCachedPrice() : async ?Text {
    switch (textMap.get(priceCache, "APTUSDT")) {
      case (null) { null };
      case (?data) { ?data.0 };
    };
  };

  public func setNetworkPreference(userId : Text, network : Text) : async () {
    networkPrefs := textMap.put(networkPrefs, userId, network);
  };

  public func getNetworkPreference(userId : Text) : async ?Text {
    textMap.get(networkPrefs, userId);
  };

  public func requestTestnetFaucet(address : Text) : async Text {
    let url = "https://faucet.testnet.aptoslabs.com?address=" # address;
    await OutCall.httpGetRequest(url, [], transform);
  };

  public func requestDevnetFaucet(address : Text) : async Text {
    let url = "https://faucet.devnet.aptoslabs.com/mint?amount=100000000&address=" # address;
    let response = await OutCall.httpPostRequest(url, [], "", transform);
    response;
  };

  public func setBip39Words(words : [Text]) : async () {
    bip39Words := words;
  };

  public query func getBip39Words() : async [Text] {
    bip39Words;
  };

  public func generateMnemonic() : async [Text] {
    if (bip39Words.size() == 0) {
      return [];
    };

    var uniqueWordsMap = textMap.empty<()>();
    var uniqueLettersMap = charMap.empty<()>();
    var mnemonic : [Text] = [];

    let randomSeed = Time.now();
    let randomIndex = func(max : Nat) : Nat {
      Int.abs((randomSeed % 1000000) % max);
    };

    // Create a list of available words with unique starting letters
    var availableWordsMap = charMap.empty<Text>();
    for (word in bip39Words.vals()) {
      let firstChar = Text.toArray(word)[0];
      if (charMap.get(availableWordsMap, firstChar) == null) {
        availableWordsMap := charMap.put(availableWordsMap, firstChar, word);
      };
    };

    let availableWords = Iter.toArray(charMap.vals(availableWordsMap));

    if (availableWords.size() < 12) {
      Debug.trap("Not enough unique starting letters in BIP39 word list");
    };

    var i = 0;
    while (i < 12) {
      let word = availableWords[randomIndex(availableWords.size())];
      if (textMap.get(uniqueWordsMap, word) == null) {
        let firstChar = Text.toArray(word)[0];
        if (charMap.get(uniqueLettersMap, firstChar) == null) {
          uniqueWordsMap := textMap.put(uniqueWordsMap, word, ());
          uniqueLettersMap := charMap.put(uniqueLettersMap, firstChar, ());
          mnemonic := Array.append(mnemonic, [word]);
          i += 1;
        };
      };
    };

    mnemonicWords := mnemonic;
    mnemonic;
  };

  public query func validateMnemonic(mnemonic : [Text]) : async Bool {
    if (mnemonic.size() != 12) {
      return false;
    };

    var uniqueWordsMap = textMap.empty<()>();
    var uniqueLettersMap = charMap.empty<()>();

    for (word in mnemonic.vals()) {
      if (textMap.get(uniqueWordsMap, word) != null) {
        return false;
      };
      uniqueWordsMap := textMap.put(uniqueWordsMap, word, ());

      let firstChar = Text.toArray(word)[0];
      if (charMap.get(uniqueLettersMap, firstChar) != null) {
        return false;
      };
      uniqueLettersMap := charMap.put(uniqueLettersMap, firstChar, ());
    };

    true;
  };

  public query func getAvailableWords() : async [Text] {
    bip39Words;
  };

  // Test function for mnemonic generation
  public func testGenerateMnemonic() : async () {
    if (bip39Words.size() == 0) {
      Debug.trap("BIP39 word list is empty");
    };

    let mnemonic = await generateMnemonic();

    if (mnemonic.size() != 12) {
      Debug.trap("Mnemonic does not have 12 words");
    };

    var uniqueWordsMap = textMap.empty<()>();
    var uniqueLettersMap = charMap.empty<()>();

    for (word in mnemonic.vals()) {
      if (textMap.get(uniqueWordsMap, word) != null) {
        Debug.trap("Duplicate word found in mnemonic: " # word);
      };
      uniqueWordsMap := textMap.put(uniqueWordsMap, word, ());

      let firstChar = Text.toArray(word)[0];
      if (charMap.get(uniqueLettersMap, firstChar) != null) {
        Debug.trap("Duplicate starting letter found in mnemonic: " # word);
      };
      uniqueLettersMap := charMap.put(uniqueLettersMap, firstChar, ());
    };
  };

  // New function to generate and validate multiple mnemonics
  public func generateAndValidateMultiple(count : Nat) : async () {
    if (bip39Words.size() == 0) {
      Debug.trap("BIP39 word list is empty");
    };

    var i = 0;
    while (i < count) {
      let mnemonic = await generateMnemonic();

      if (mnemonic.size() != 12) {
        Debug.trap("Mnemonic does not have 12 words");
      };

      var uniqueWordsMap = textMap.empty<()>();
      var uniqueLettersMap = charMap.empty<()>();

      for (word in mnemonic.vals()) {
        if (textMap.get(uniqueWordsMap, word) != null) {
          Debug.trap("Duplicate word found in mnemonic: " # word);
        };
        uniqueWordsMap := textMap.put(uniqueWordsMap, word, ());

        let firstChar = Text.toArray(word)[0];
        if (charMap.get(uniqueLettersMap, firstChar) != null) {
          Debug.trap("Duplicate starting letter found in mnemonic: " # word);
        };
        uniqueLettersMap := charMap.put(uniqueLettersMap, firstChar, ());
      };

      i += 1;
    };
  };

  // New function to generate Aptos Devnet explorer URL
  public query func getDevnetExplorerUrl(transactionHash : Text) : async Text {
    "https://explorer.aptoslabs.com/txn/" # transactionHash # "?network=devnet";
  };
};

