namespace Audible.Interfaces.Messages.PiCalculator
{
    public class CalculatingArcTanMessage : MessageBase<uint>
    {
        public CalculatingArcTanMessage()
        {

        }

        public CalculatingArcTanMessage(uint data) : base(data)
        {

        }

        public CalculatingArcTanMessage(uint data, object sender) : base(data, sender)
        {

        }

        public CalculatingArcTanMessage(uint data, object sender, string key) : base(data, sender, key)
        {

        }
    }
}
