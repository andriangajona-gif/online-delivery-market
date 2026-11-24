module {
  public type TelegramSettings = {
    botToken : Text;
    chatId : Text;
  };

  public type TelegramSettingsView = {
    botToken : Text;
    chatId : Text;
    configured : Bool;
  };

  public type TelegramTestResult = {
    #ok;
    #err : Text;
  };
};
