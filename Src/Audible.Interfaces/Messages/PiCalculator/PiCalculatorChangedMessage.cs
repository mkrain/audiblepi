namespace Audible.Interfaces.Messages.PiCalculator
{
    public class PiCalculatorChangedMessage  : MessageBase<bool>
    {
              public PiCalculatorChangedMessage()
        {

        }

        public PiCalculatorChangedMessage(bool data) : base(data)
        {

        }

        public PiCalculatorChangedMessage(bool data, object sender) : base(data, sender)
        {

        }

        public PiCalculatorChangedMessage(bool data, object sender, string key) : base(data, sender, key)
        {

        }
    }
}