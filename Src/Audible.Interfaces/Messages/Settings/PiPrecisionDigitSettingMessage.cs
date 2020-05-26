
namespace Audible.Interfaces.Messages.Settings
{
    public class PiPrecisionDigitSettingMessage : SettingsMessage
    {
        public PiPrecisionDigitSettingMessage()
        {

        }

        public PiPrecisionDigitSettingMessage(int data) : base(data)
        {

        }

        public PiPrecisionDigitSettingMessage(int data, object sender) : base(data, sender)
        {

        }

        public PiPrecisionDigitSettingMessage(int data, object sender, string key) : base(data, sender, key)
        {

        }
    }
}
