using System;

namespace Audible.Interfaces.Provider
{
    public class CalculatingArcTanEventArgs : EventArgs
    {
        public uint Divisor { get; set; }
        public string X { get; set; }

        public CalculatingArcTanEventArgs()
        {
            
        }
    }
}