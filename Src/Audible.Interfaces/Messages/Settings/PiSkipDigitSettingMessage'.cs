
namespace Audible.Interfaces.Messages.Settings
{
    public class PiSkipDigitSettingMessage : SettingsMessage
    {
        public PiSkipDigitSettingMessage()
        {

        }

        public PiSkipDigitSettingMessage(int data) : base(data)
        {

        }

        public PiSkipDigitSettingMessage(int data, object sender) : base(data, sender)
        {

        }

        public PiSkipDigitSettingMessage(int data, object sender, string key) : base(data, sender, key)
        {

        }
    }
}